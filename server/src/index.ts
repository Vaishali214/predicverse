import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ensureDatabaseReady, stopDatabaseServer } from './lib/db-server.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { tripsRouter } from './routes/trips.js';
import { itineraryRouter } from './routes/itinerary.js';
import { wishlistRouter } from './routes/wishlist.js';
import { passportRouter } from './routes/passport.js';
import { hiddenGemsRouter } from './routes/hidden-gems.js';
import { articlesRouter } from './routes/articles.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARE
// ============================================================

// Security headers (production hardening)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (IS_PRODUCTION) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// CORS — allow requests from Vite dev server, preview, and production client domain
const defaultOrigins = IS_PRODUCTION
  ? [] // In production, rely solely on CLIENT_ORIGIN
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];

const envOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // In production: reject requests with no origin header (strict mode)
      // In development: allow no-origin for tools like curl/Postman
      if (!origin) {
        callback(null, !IS_PRODUCTION);
        return;
      }
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);

// Body parsing — limit to 1mb to prevent abuse
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// HEALTH CHECK ENDPOINTS (Root & API)
// ============================================================

const startTime = Date.now();

const healthHandler = async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    const { prisma } = await import('./lib/prisma.js');
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    service: 'PredicVerse Backend Gazette Service',
    version: '1.0.0',
    environment: IS_PRODUCTION ? 'production' : 'development',
    database: dbStatus,
    uptime: uptimeSeconds,
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ============================================================
// ROUTES
// ============================================================

import { travelRouter } from './routes/travel.js';
import { sharedRouter } from './routes/shared.js';

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/trips', tripsRouter);
app.use('/api', itineraryRouter); // Mounts /api/trips/:id/itinerary and /api/itinerary/*
app.use('/api/wishlist', wishlistRouter);
app.use('/api/passport', passportRouter);
app.use('/api/hidden-gems', hiddenGemsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/travel', travelRouter);
app.use('/api/shared', sharedRouter);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// ============================================================
// START SERVER
// ============================================================
async function startServer() {
  await ensureDatabaseReady();
  const server = app.listen(PORT, () => {
    console.log(`[PredicVerse Server] Running on http://localhost:${PORT}`);
    console.log(`[PredicVerse Server] Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`[PredicVerse Server] PostgreSQL + Prisma + Auth + AI Intelligence`);
  });

  // Graceful shutdown handler for production deployments
  const gracefulShutdown = async (signal: string) => {
    console.log(`[PredicVerse Server] ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      try {
        const { prisma } = await import('./lib/prisma.js');
        await prisma.$disconnect();
      } catch { /* ignore */ }
      await stopDatabaseServer();
      console.log('[PredicVerse Server] Shutdown complete.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[PredicVerse Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[PredicVerse Server] Boot failure:', err);
  process.exit(1);
});
