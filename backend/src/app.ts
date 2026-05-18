import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';

import logger from './config/logger';
import { testConnection } from './config/database';
import { cache, priceCache } from './config/cache';

import commoditiesRouter from './routes/commodities';
import shippingRouter from './routes/shipping';
import newsRouter from './routes/news';
import dashboardRouter from './routes/dashboard';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, { query: req.query });
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/dashboard', dashboardRouter);
app.use('/api/commodities', commoditiesRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/news', newsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: {
      keys: cache.keys().length,
      priceKeys: priceCache.keys().length,
    },
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'GlobalTrade Dashboard API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api/dashboard',
      'GET /api/commodities',
      'GET /api/commodities/:symbol',
      'GET /api/commodities/:symbol/history',
      'GET /api/commodities/:symbol/signal',
      'GET /api/commodities/signals/all',
      'GET /api/commodities/rankings/beneficiaries',
      'GET /api/shipping',
      'GET /api/shipping/:routeId',
      'GET /api/news',
    ],
  });
});

// 404 & error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Scheduled Cache Refresh ─────────────────────────────────────────────────
// Refresh prices every 5 minutes during market hours (Mon-Fri)
cron.schedule('*/5 * * * 1-5', async () => {
  logger.info('Scheduled: invalidating price caches');
  priceCache.flushAll();
  cache.del('all_prices');
  cache.del('dashboard_summary');
});

// Refresh signals every 30 minutes
cron.schedule('*/30 * * * *', () => {
  cache.del('all_signals');
  cache.del('beneficiary_rankings');
  logger.info('Scheduled: invalidated signal caches');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  // Test DB connection (non-blocking — app works without DB with static data)
  const dbOk = await testConnection().catch(() => false);
  if (!dbOk) {
    logger.warn('Database unavailable — shipping routes will use static fallback data');
  }

  app.listen(PORT, () => {
    logger.info(`GlobalTrade Dashboard API running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`DB connected: ${dbOk}`);
  });
}

start();

export default app;
