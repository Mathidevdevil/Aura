import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './authService';
import { loginLimiter, forgotPasswordLimiter, registerLimiter } from './rateLimiter';
import { verifyAccessToken, TokenPayload } from './jwt';
import { hashToken } from './crypto';

export const authRouter = Router();

// Middleware: Require Authenticated JWT
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      type: 'https://aura.local/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication required. No valid bearer token provided.',
      code: 'AUTH_UNAUTHORIZED',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({
      type: 'https://aura.local/errors/token-expired',
      title: 'Token Expired',
      status: 401,
      detail: 'Access token expired or signature invalid.',
      code: 'AUTH_TOKEN_EXPIRED',
    });
  }

  (req as any).user = payload;
  next();
}

// 1. REGISTER
authRouter.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        type: 'https://aura.local/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Name, email, and password are required fields.',
        code: 'VALIDATION_ERROR',
      });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await AuthService.register(name, email, password, ip, userAgent);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// 2. LOGIN
authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        type: 'https://aura.local/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Email and password are required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await AuthService.login(email, password, !!rememberMe, ip, userAgent);

    // Set HTTP-Only Cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined;
    res.cookie('aura_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false, // Set false for localhost dev; true in production with HTTPS
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge,
    });

    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
});

// 3. REFRESH
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.aura_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({
        type: 'https://aura.local/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'No refresh token provided in session cookie.',
        code: 'AUTH_NO_REFRESH_TOKEN',
      });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await AuthService.refresh(refreshToken, ip, userAgent);

    // Set rotated token in cookie
    res.cookie('aura_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err: any) {
    // If token family was revoked or invalid, clear cookie
    res.clearCookie('aura_refresh_token', { path: '/api/v1/auth' });
    next(err);
  }
});

// 4. LOGOUT
authRouter.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.aura_refresh_token;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuthService.logout(refreshToken, ip, userAgent);
    res.clearCookie('aura_refresh_token', { path: '/api/v1/auth' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// 5. FORGOT PASSWORD
authRouter.post('/forgot-password', forgotPasswordLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        type: 'https://aura.local/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Email is required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuthService.forgotPassword(email, ip, userAgent);
    // Anti-enumeration: Always returns 200 with identical payload
    res.json({
      status: 200,
      detail: 'If an account exists with this email address, password reset instructions have been dispatched.',
    });
  } catch (err) {
    next(err);
  }
});

// 6. RESET PASSWORD
authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuthService.resetPassword(token, newPassword, ip, userAgent);
    res.json({ status: 200, detail: 'Password has been reset successfully.' });
  } catch (err) {
    next(err);
  }
});

// 7. VERIFY EMAIL
authRouter.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await AuthService.verifyEmail(token, ip, userAgent);

    res.cookie('aura_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
});

// 8. RESEND VERIFICATION
authRouter.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuthService.resendVerification(email, ip, userAgent);
    res.json({ status: 200, detail: 'Verification instructions dispatched if unverified account exists.' });
  } catch (err) {
    next(err);
  }
});

// 9. GET /me (Current User Profile)
authRouter.get('/me', requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

// 10. GOOGLE OAUTH2 (Supports Real Google Cloud Credentials + Local Fallback)
authRouter.get('/oauth/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/google/callback`;

  if (clientId) {
    // Real Google OAuth2 flow
    const state = Math.random().toString(36).substring(7);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=select_account`;
    return res.redirect(googleAuthUrl);
  }

  // Instant local dev mode fallback when credentials are not yet configured
  console.log('[AURA GOOGLE AUTH] No GOOGLE_CLIENT_ID in env. Using simulated instant Google login.');
  const demoState = 'state_' + Math.random().toString(36).substring(7);
  res.redirect(`/api/v1/auth/oauth/google/callback?code=mock_google_code_123&state=${demoState}`);
});

authRouter.get('/oauth/google/callback', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Google-OAuth-Agent';
  const { code } = req.query;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/google/callback`;

  try {
    let email = 'google.user@example.com';
    let name = 'Google User';
    let providerUserId = 'mock_google_sub_123';

    if (clientId && clientSecret && code && code !== 'mock_google_code_123') {
      // Exchange authorization code with Google OAuth token endpoint
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(code),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code with Google');
      }

      const tokenData = await tokenResponse.json();

      // Retrieve Google user profile
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to retrieve user profile from Google');
      }

      const userInfo = await userInfoResponse.json();
      email = userInfo.email;
      name = userInfo.name || 'Google User';
      providerUserId = userInfo.sub;
    }

    // Resolve or create user in database with verified email account linking
    const result = await AuthService.findOrCreateOAuthUser('google', providerUserId, email, name, ip, userAgent);

    // Set secure HTTP-only refresh token cookie
    res.cookie('aura_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false, // Set false for localhost dev; true in production HTTPS
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect('/');
  } catch (err: any) {
    console.error('[AURA GOOGLE AUTH ERROR]', err);
    res.redirect('/login?error=oauth_failed');
  }
});

// 11. PROFILE & SETTINGS
authRouter.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = (req as any).user.sub;
    const updated = await AuthService.updateProfile(userId, name);
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.sub;
    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuthService.changePassword(userId, currentPassword, newPassword, ip, userAgent);
    res.json({ status: 200, detail: 'Password updated and other sessions revoked.' });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/sessions', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.sub;
    const refreshToken = req.cookies?.aura_refresh_token;
    const tokenHash = refreshToken ? hashToken(refreshToken) : undefined;

    const sessions = await AuthService.listSessions(userId, tokenHash);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

authRouter.delete('/sessions/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.sub;
    await AuthService.revokeSession(userId, req.params.id);
    res.json({ status: 200, detail: 'Session revoked.' });
  } catch (err) {
    next(err);
  }
});

authRouter.delete('/account', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.sub;
    const { confirmationText } = req.body;

    await AuthService.deleteAccount(userId, confirmationText);
    res.clearCookie('aura_refresh_token', { path: '/api/v1/auth' });
    res.json({ status: 200, detail: 'Account and associated records purged successfully.' });
  } catch (err) {
    next(err);
  }
});

