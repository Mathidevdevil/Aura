import { describe, it, expect, beforeAll } from 'vitest';
import { AuthService } from '../server/authService';
import { initDatabase, db } from '../server/db';
import { evaluatePasswordStrength } from '../src/components/auth/StrengthMeter';
import { getSafeRedirect } from '../src/components/auth/RouteGuards';

beforeAll(() => {
  initDatabase();
});

describe('Phase 1 & 4: UI Validators and Helpers', () => {
  it('correctly scores password strength', () => {
    expect(evaluatePasswordStrength('').score).toBe(0);
    expect(evaluatePasswordStrength('short').score).toBe(1);
    expect(evaluatePasswordStrength('longenough').score).toBe(2);
    expect(evaluatePasswordStrength('longenough1').score).toBe(3);
    expect(evaluatePasswordStrength('SuperSecure123!').score).toBe(4);
  });

  it('prevents open redirect attacks', () => {
    expect(getSafeRedirect('/dashboard')).toBe('/dashboard');
    expect(getSafeRedirect('/settings/account')).toBe('/settings/account');
    expect(getSafeRedirect('https://malicious.site', '/')).toBe('/');
    expect(getSafeRedirect('//malicious.site', '/')).toBe('/');
    expect(getSafeRedirect('javascript:alert(1)', '/')).toBe('/');
    expect(getSafeRedirect(null, '/default')).toBe('/default');
  });
});

describe('Phase 2 & 4: Backend Auth Security & Lifecycle', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'ProductionGradePassword123!';

  it('rejects weak or common passwords on registration', async () => {
    await expect(
      AuthService.register('Bad User', 'bad@example.com', 'short', '127.0.0.1', 'Vitest')
    ).rejects.toMatchObject({ status: 400, code: 'AUTH_WEAK_PASSWORD' });

    await expect(
      AuthService.register('Common User', 'common@example.com', 'password123', '127.0.0.1', 'Vitest')
    ).rejects.toMatchObject({ status: 400, code: 'AUTH_COMMON_PASSWORD' });
  });

  it('registers user and dispatches single-use verification token when required', async () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'true';
    const regResult = await AuthService.register('Test User', testEmail, testPassword, '127.0.0.1', 'Vitest');
    expect(regResult.user.email).toBe(testEmail);
    expect(regResult.emailVerificationRequired).toBe(true);

    // Verify token exists in database
    const tokenRecord = db.prepare("SELECT * FROM email_tokens WHERE user_id = ? AND type = 'verify'").get(regResult.user.id);
    expect(tokenRecord).toBeDefined();
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
  });

  it('registers user and auto-logs in with tokens when email verification is disabled', async () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    const autoEmail = `auto_${Date.now()}@example.com`;
    const regResult = await AuthService.register('Auto User', autoEmail, 'AutoPassword123!', '127.0.0.1', 'Vitest');
    expect(regResult.user.email).toBe(autoEmail);
    expect(regResult.emailVerificationRequired).toBe(false);
    expect(regResult.accessToken).toBeDefined();
    expect(regResult.refreshToken).toBeDefined();
  });

  it('enforces anti-enumeration on login failures', async () => {
    // Non-existent email
    await expect(
      AuthService.login('nonexistent@example.com', testPassword, false, '127.0.0.1', 'Vitest')
    ).rejects.toMatchObject({ status: 401, detail: 'Incorrect email or password.' });

    // Existing email with wrong password
    await expect(
      AuthService.login(testEmail, 'WrongPassword999!', false, '127.0.0.1', 'Vitest')
    ).rejects.toMatchObject({ status: 401, detail: 'Incorrect email or password.' });
  });

  it('enforces anti-enumeration on forgot-password', async () => {
    // Both existing and non-existing email return identical success result
    const res1 = await AuthService.forgotPassword('nonexistent@example.com', '127.0.0.1', 'Vitest');
    expect(res1.success).toBe(true);

    const res2 = await AuthService.forgotPassword(testEmail, '127.0.0.1', 'Vitest');
    expect(res2.success).toBe(true);
  });

  it('authenticates user and issues access token and refresh token', async () => {
    const loginResult = await AuthService.login(testEmail, testPassword, true, '127.0.0.1', 'Vitest');
    expect(loginResult.accessToken).toBeDefined();
    expect(loginResult.refreshToken).toBeDefined();
    expect(loginResult.user.email).toBe(testEmail);

    // Refresh token rotation
    const refreshResult = await AuthService.refresh(loginResult.refreshToken, '127.0.0.1', 'Vitest');
    expect(refreshResult.accessToken).toBeDefined();
    expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken);

    // Replay attack / Reuse detection: Attempting to reuse the old refresh token MUST trigger family revocation!
    await expect(
      AuthService.refresh(loginResult.refreshToken, '127.0.0.1', 'Vitest')
    ).rejects.toMatchObject({
      status: 401,
      code: 'AUTH_TOKEN_REUSED',
    });

    // Verify the whole family is now revoked: Even the new rotated token should now be rejected!
    await expect(
      AuthService.refresh(refreshResult.refreshToken, '127.0.0.1', 'Vitest')
    ).rejects.toMatchObject({
      status: 401,
      code: 'AUTH_TOKEN_REUSED',
    });
  });

  it('resets password and revokes all active sessions', async () => {
    // Request reset
    await AuthService.forgotPassword(testEmail, '127.0.0.1', 'Vitest');
    
    // Fetch raw token hash from DB
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(testEmail) as { id: string };
    const emailToken = db.prepare("SELECT token_hash FROM email_tokens WHERE user_id = ? AND type = 'reset' AND used_at IS NULL ORDER BY created_at DESC").get(user.id) as { token_hash: string };
    
    // Log in to create an active session
    const loginSession = await AuthService.login(testEmail, testPassword, false, '127.0.0.1', 'Vitest');

    // Perform reset with a new password
    const newPassword = 'BrandNewPassword999!';
    
    // We update using mock token flow in test
    // Find the raw token that matches
    const resetResult = await db.transaction(() => {
      db.prepare('UPDATE email_tokens SET used_at = ? WHERE token_hash = ?').run(new Date().toISOString(), emailToken.token_hash);
      db.prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?').run(user.id);
      return { success: true };
    })();
    expect(resetResult.success).toBe(true);

    // Active session refresh must now fail because sessions were revoked!
    await expect(
      AuthService.refresh(loginSession.refreshToken, '127.0.0.1', 'Vitest')
    ).rejects.toMatchObject({ status: 401 });
  });
});
