import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      type: 'https://aura.local/errors/too-many-requests',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Too many login attempts. Please wait 60 seconds before trying again.',
      code: 'AUTH_RATE_LIMITED',
    });
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      type: 'https://aura.local/errors/too-many-requests',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Too many password reset requests. Please wait an hour before requesting another.',
      code: 'AUTH_RATE_LIMITED',
    });
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      type: 'https://aura.local/errors/too-many-requests',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Too many account registrations from this IP address.',
      code: 'AUTH_RATE_LIMITED',
    });
  },
});
