import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDatabase } from './db';
import { authRouter } from './routes';

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize database schema
initDatabase();

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';");
  next();
});

// CORS Configuration with credentials (supports localhost + Vercel deployment URLs)
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin || 
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      origin.endsWith('.vercel.app') ||
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
    ) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json());
app.use(cookieParser());

// Mount API Routes under /api/v1/auth
app.use('/api/v1/auth', authRouter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'UP', service: 'Aura Authentication Core', timestamp: new Date().toISOString() });
});

// RFC 7807 Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  const title = err.title || (status === 500 ? 'Internal Server Error' : 'Request Error');
  const code = err.code || (status === 500 ? 'SERVER_INTERNAL_ERROR' : 'REQUEST_ERROR');
  const detail = err.detail || (status === 500 ? 'An unexpected server error occurred.' : err.message || 'Error processing request.');

  // Log error without sensitive data
  if (status === 500) {
    console.error(`[AURA AUTH SERVER ERROR] ${req.method} ${req.path}:`, err);
  }

  res.status(status).json({
    type: `https://aura.local/errors/${code.toLowerCase().replace(/_/g, '-')}`,
    title,
    status,
    detail,
    code,
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ Aura Auth Server running on http://localhost:${PORT}`);
  console.log(`🔒 API Endpoints mounted at http://localhost:${PORT}/api/v1/auth`);
  console.log(`======================================================\n`);
});

export default app;

