import { db } from './db';
import crypto from 'crypto';
import { 
  hashPassword, 
  verifyPassword, 
  isCommonPassword, 
  generateRandomToken, 
  hashToken 
} from './crypto';
import { signAccessToken } from './jwt';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  email_verified_at: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  family_id: string;
  token_hash: string;
  is_revoked: number;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
}

export class AuthService {
  // Audit log event
  private static logAudit(userId: string | null, event: string, ip: string, userAgent: string) {
    db.prepare(`
      INSERT INTO audit_log (id, user_id, event_type, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), userId, event, ip, userAgent, new Date().toISOString());
  }

  // 1. REGISTER
  static async register(name: string, email: string, password: string, ip: string, userAgent: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check password rules
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw { status: 400, code: 'AUTH_WEAK_PASSWORD', detail: 'Password must be at least 8 characters with at least one letter and one number.' };
    }
    if (isCommonPassword(password)) {
      throw { status: 400, code: 'AUTH_COMMON_PASSWORD', detail: 'This password is too common and easily guessed. Please choose a stronger password.' };
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail) as { id: string } | undefined;
    if (existing) {
      throw { status: 409, code: 'AUTH_EMAIL_EXISTS', detail: 'An account with this email address already exists.' };
    }

    const userId = crypto.randomUUID();
    const pwdHash = await hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, email_verified_at, status, created_at)
      VALUES (?, ?, ?, ?, NULL, 'active', ?)
    `).run(userId, cleanEmail, pwdHash, cleanName, now);

    // Create verification token (24h expiry)
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO email_tokens (id, user_id, type, token_hash, expires_at, created_at)
      VALUES (?, ?, 'verify', ?, ?, ?)
    `).run(crypto.randomUUID(), userId, tokenHash, expiresAt, now);

    this.logAudit(userId, 'USER_REGISTERED', ip, userAgent);

    // Dev Email Console Logger
    console.log('\n======================================================');
    console.log('✉️  [AURA DEV EMAIL SERVICE] Verification Email Sent:');
    console.log(`To: ${cleanEmail}`);
    console.log(`Link: http://localhost:3000/verify-email?token=${rawToken}`);
    console.log('======================================================\n');

    return {
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        emailVerified: false,
        status: 'active',
        createdAt: now,
      },
      emailVerificationRequired: true,
    };
  }

  // 2. LOGIN
  static async login(email: string, password: string, rememberMe: boolean, ip: string, userAgent: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as UserRow | undefined;

    // Constant-time behavior on non-existent user
    if (!user || !user.password_hash) {
      // Dummy verify to equalize response timing against timing attacks
      await hashPassword('dummy-password-timing-defense');
      throw { status: 401, code: 'AUTH_INVALID_CREDENTIALS', detail: 'Incorrect email or password.' };
    }

    const isValid = await verifyPassword(user.password_hash, password);
    if (!isValid) {
      this.logAudit(user.id, 'LOGIN_FAILED_WRONG_PASSWORD', ip, userAgent);
      throw { status: 401, code: 'AUTH_INVALID_CREDENTIALS', detail: 'Incorrect email or password.' };
    }

    if (user.status !== 'active') {
      throw { status: 403, code: 'AUTH_ACCOUNT_SUSPENDED', detail: 'This account has been suspended.' };
    }

    // Generate JWT access token (15m)
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    // Generate Refresh Token in new Family
    const rawRefreshToken = generateRandomToken(32);
    const refreshTokenHash = hashToken(rawRefreshToken);
    const familyId = crypto.randomUUID();
    const tokenId = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiryDays = rememberMe ? 30 : 1;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, family_id, token_hash, is_revoked, user_agent, ip_address, created_at, expires_at)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
    `).run(tokenId, user.id, familyId, refreshTokenHash, userAgent, ip, now, expiresAt);

    // Update last login
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);
    this.logAudit(user.id, 'LOGIN_SUCCESS', ip, userAgent);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      rememberMe,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: !!user.email_verified_at,
        status: user.status,
        createdAt: user.created_at,
        lastLoginAt: now,
      },
    };
  }

  // 3. REFRESH TOKEN (With Rotation & Family Reuse Detection)
  static async refresh(rawRefreshToken: string, ip: string, userAgent: string) {
    if (!rawRefreshToken) {
      throw { status: 401, code: 'AUTH_MISSING_TOKEN', detail: 'Refresh token is required.' };
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?').get(tokenHash) as RefreshTokenRow | undefined;

    if (!storedToken) {
      throw { status: 401, code: 'AUTH_INVALID_TOKEN', detail: 'Session expired or invalid.' };
    }

    // Check token family reuse: If token was already revoked, someone is replaying an old token!
    if (storedToken.is_revoked === 1) {
      // REVOKE ENTIRE FAMILY IMMEDIATELY!
      db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE family_id = ?').run(storedToken.family_id);
      this.logAudit(storedToken.user_id, 'REFRESH_TOKEN_REUSE_DETECTED_FAMILY_REVOKED', ip, userAgent);
      throw { 
        status: 401, 
        code: 'AUTH_TOKEN_REUSED', 
        detail: 'Session anomaly detected. All active sessions in this family have been revoked for your security.' 
      };
    }

    // Check expiration
    if (new Date(storedToken.expires_at).getTime() < Date.now()) {
      db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ?').run(storedToken.id);
      throw { status: 401, code: 'AUTH_TOKEN_EXPIRED', detail: 'Session has expired. Please sign in again.' };
    }

    // Mark current token as rotated (revoked)
    db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ?').run(storedToken.id);

    // Issue new token in SAME family
    const nextRawRefreshToken = generateRandomToken(32);
    const nextTokenHash = hashToken(nextRawRefreshToken);
    const nextTokenId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Preserve original expiry window
    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, family_id, token_hash, is_revoked, user_agent, ip_address, created_at, expires_at)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
    `).run(nextTokenId, storedToken.user_id, storedToken.family_id, nextTokenHash, userAgent, ip, now, storedToken.expires_at);

    // Fetch user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(storedToken.user_id) as UserRow;
    if (!user || user.status !== 'active') {
      throw { status: 403, code: 'AUTH_ACCOUNT_SUSPENDED', detail: 'Account is no longer active.' };
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      accessToken,
      refreshToken: nextRawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: !!user.email_verified_at,
        status: user.status,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    };
  }

  // 4. LOGOUT
  static async logout(rawRefreshToken: string | undefined, ip: string, userAgent: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const token = db.prepare('SELECT user_id FROM refresh_tokens WHERE token_hash = ?').get(tokenHash) as { user_id: string } | undefined;
      db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?').run(tokenHash);
      if (token) {
        this.logAudit(token.user_id, 'USER_LOGOUT', ip, userAgent);
      }
    }
  }

  // 5. FORGOT PASSWORD (Anti-enumeration guaranteed)
  static async forgotPassword(email: string, ip: string, userAgent: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(cleanEmail) as { id: string; email: string } | undefined;

    if (user) {
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO email_tokens (id, user_id, type, token_hash, expires_at, created_at)
        VALUES (?, ?, 'reset', ?, ?, ?)
      `).run(crypto.randomUUID(), user.id, tokenHash, expiresAt, now);

      this.logAudit(user.id, 'PASSWORD_RESET_REQUESTED', ip, userAgent);

      // Dev Email Console Logger
      console.log('\n======================================================');
      console.log('🔑  [AURA DEV EMAIL SERVICE] Password Reset Link Sent:');
      console.log(`To: ${user.email}`);
      console.log(`Link: http://localhost:3000/reset-password?token=${rawToken}`);
      console.log('Expires: 30 minutes');
      console.log('======================================================\n');
    } else {
      // Dummy calculation to maintain consistent timing
      await hashPassword('dummy-timing-equalizer');
    }

    return { success: true };
  }

  // 6. RESET PASSWORD (Revokes all active sessions)
  static async resetPassword(rawToken: string, newPassword: string, ip: string, userAgent: string) {
    if (!rawToken) {
      throw { status: 400, code: 'AUTH_INVALID_TOKEN', detail: 'Reset token is required.' };
    }

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      throw { status: 400, code: 'AUTH_WEAK_PASSWORD', detail: 'Password must be at least 8 characters with at least one letter and one number.' };
    }
    if (isCommonPassword(newPassword)) {
      throw { status: 400, code: 'AUTH_COMMON_PASSWORD', detail: 'This password is too common and easily guessed.' };
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = db.prepare(`
      SELECT * FROM email_tokens 
      WHERE token_hash = ? AND type = 'reset' AND used_at IS NULL
    `).get(tokenHash) as { id: string; user_id: string; expires_at: string } | undefined;

    if (!tokenRecord) {
      throw { status: 400, code: 'AUTH_INVALID_TOKEN', detail: 'Password reset link is invalid or has already been used.' };
    }

    if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
      throw { status: 400, code: 'AUTH_TOKEN_EXPIRED', detail: 'Password reset link has expired (30m limit).' };
    }

    const now = new Date().toISOString();
    const newHash = await hashPassword(newPassword);

    // Update password and mark token used
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, tokenRecord.user_id);
    db.prepare('UPDATE email_tokens SET used_at = ? WHERE id = ?').run(now, tokenRecord.id);

    // REVOKE ALL ACTIVE SESSIONS FOR THIS USER
    db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?').run(tokenRecord.user_id);
    this.logAudit(tokenRecord.user_id, 'PASSWORD_RESET_SUCCESS_ALL_SESSIONS_REVOKED', ip, userAgent);

    return { success: true };
  }

  // 7. VERIFY EMAIL
  static async verifyEmail(rawToken: string, ip: string, userAgent: string) {
    if (!rawToken) {
      throw { status: 400, code: 'AUTH_INVALID_TOKEN', detail: 'Verification token is required.' };
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = db.prepare(`
      SELECT * FROM email_tokens 
      WHERE token_hash = ? AND type = 'verify' AND used_at IS NULL
    `).get(tokenHash) as { id: string; user_id: string; expires_at: string } | undefined;

    if (!tokenRecord) {
      throw { status: 400, code: 'AUTH_INVALID_TOKEN', detail: 'Verification link is invalid or already used.' };
    }

    if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
      throw { status: 400, code: 'AUTH_TOKEN_EXPIRED', detail: 'Verification link has expired (24h limit).' };
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET email_verified_at = ? WHERE id = ?').run(now, tokenRecord.user_id);
    db.prepare('UPDATE email_tokens SET used_at = ? WHERE id = ?').run(now, tokenRecord.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(tokenRecord.user_id) as UserRow;
    this.logAudit(user.id, 'EMAIL_VERIFIED', ip, userAgent);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const rawRefreshToken = generateRandomToken(32);
    const refreshTokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, family_id, token_hash, is_revoked, user_agent, ip_address, created_at, expires_at)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), user.id, crypto.randomUUID(), refreshTokenHash, userAgent, ip, now, expiresAt);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true,
        status: user.status,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    };
  }

  // 8. RESEND VERIFICATION
  static async resendVerification(email: string, ip: string, userAgent: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, email, email_verified_at FROM users WHERE email = ?').get(cleanEmail) as { id: string; email: string; email_verified_at: string | null } | undefined;

    if (user && !user.email_verified_at) {
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO email_tokens (id, user_id, type, token_hash, expires_at, created_at)
        VALUES (?, ?, 'verify', ?, ?, ?)
      `).run(crypto.randomUUID(), user.id, tokenHash, expiresAt, now);

      this.logAudit(user.id, 'VERIFICATION_RESENT', ip, userAgent);

      console.log('\n======================================================');
      console.log('✉️  [AURA DEV EMAIL SERVICE] Verification Email Resent:');
      console.log(`To: ${user.email}`);
      console.log(`Link: http://localhost:3000/verify-email?token=${rawToken}`);
      console.log('======================================================\n');
    }

    return { success: true };
  }

  // 9. PROFILE & SESSIONS
  static async updateProfile(userId: string, name: string) {
    const cleanName = name.trim();
    if (!cleanName) {
      throw { status: 400, code: 'VALIDATION_ERROR', detail: 'Name cannot be empty.' };
    }
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(cleanName, userId);
    return db.prepare('SELECT id, email, name, email_verified_at, status, created_at FROM users WHERE id = ?').get(userId);
  }

  static async changePassword(userId: string, currentPlain: string, newPlain: string, ip: string, userAgent: string) {
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as { password_hash: string };
    const isValid = await verifyPassword(user.password_hash, currentPlain);
    if (!isValid) {
      throw { status: 400, code: 'AUTH_INVALID_CURRENT_PASSWORD', detail: 'Current password is incorrect.' };
    }

    if (newPlain.length < 8 || !/[a-zA-Z]/.test(newPlain) || !/[0-9]/.test(newPlain)) {
      throw { status: 400, code: 'AUTH_WEAK_PASSWORD', detail: 'New password must be at least 8 characters with at least one letter and one number.' };
    }
    if (isCommonPassword(newPlain)) {
      throw { status: 400, code: 'AUTH_COMMON_PASSWORD', detail: 'New password is too common.' };
    }

    const newHash = await hashPassword(newPlain);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);

    // Revoke other sessions
    db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?').run(userId);
    this.logAudit(userId, 'PASSWORD_CHANGED_OTHER_SESSIONS_REVOKED', ip, userAgent);

    return { success: true };
  }

  static async listSessions(userId: string, currentTokenHash?: string) {
    const rows = db.prepare(`
      SELECT id, user_agent, ip_address, created_at, expires_at, token_hash
      FROM refresh_tokens
      WHERE user_id = ? AND is_revoked = 0 AND datetime(expires_at) > datetime('now')
      ORDER BY created_at DESC
    `).all(userId) as Array<any>;

    return rows.map(r => ({
      id: r.id,
      userAgent: r.user_agent || 'Unknown Browser',
      ipAddress: r.ip_address || '127.0.0.1',
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      isCurrent: currentTokenHash ? r.token_hash === currentTokenHash : false,
    }));
  }

  static async revokeSession(userId: string, sessionId: string) {
    db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ? AND user_id = ?').run(sessionId, userId);
  }

  static async deleteAccount(userId: string, confirmationText: string) {
    if (confirmationText !== 'DELETE') {
      throw { status: 400, code: 'VALIDATION_ERROR', detail: 'You must type DELETE exactly to confirm.' };
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  }

  // 10. OAUTH2 USER RESOLUTION (Auto-account linking by verified email)
  static async findOrCreateOAuthUser(
    provider: string,
    providerUserId: string,
    email: string,
    name: string,
    ip: string,
    userAgent: string
  ) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || 'Google User';
    const now = new Date().toISOString();

    // 1. Check if OAuth identity already exists
    const existingIdentity = db.prepare(`
      SELECT user_id FROM oauth_identities WHERE provider = ? AND provider_user_id = ?
    `).get(provider, providerUserId) as { user_id: string } | undefined;

    let userId: string;

    if (existingIdentity) {
      userId = existingIdentity.user_id;
    } else {
      // 2. Check if user already exists by email (Account linking by verified email)
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail) as { id: string } | undefined;

      if (existingUser) {
        userId = existingUser.id;
        db.prepare('UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?').run(now, userId);
      } else {
        // Create new user without password (OAuth-only account)
        userId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO users (id, email, password_hash, name, email_verified_at, status, created_at)
          VALUES (?, ?, NULL, ?, ?, 'active', ?)
        `).run(userId, cleanEmail, cleanName, now, now);
      }

      // Link OAuth identity
      db.prepare(`
        INSERT INTO oauth_identities (id, user_id, provider, provider_user_id, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), userId, provider, providerUserId, now);
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;
    if (user.status !== 'active') {
      throw { status: 403, code: 'AUTH_ACCOUNT_SUSPENDED', detail: 'This account has been suspended.' };
    }

    // Issue JWT access token + 30-day refresh token
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const rawRefreshToken = generateRandomToken(32);
    const refreshTokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, family_id, token_hash, is_revoked, user_agent, ip_address, created_at, expires_at)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), user.id, crypto.randomUUID(), refreshTokenHash, userAgent, ip, now, expiresAt);

    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);
    this.logAudit(user.id, `OAUTH_LOGIN_SUCCESS_${provider.toUpperCase()}`, ip, userAgent);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true,
        status: user.status,
        createdAt: user.created_at,
        lastLoginAt: now,
      },
    };
  }
}

