import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AURA_JWT_SECRET || 'aura-jwt-super-secret-key-production-grade-2026';
const ACCESS_TOKEN_EXPIRY = '15m';

export interface TokenPayload {
  sub: string; // user id
  email: string;
  name: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
  } catch {
    return null;
  }
}
