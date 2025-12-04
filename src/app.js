import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import generateRoutes from './routes/generateRoutes.js';
import postsRoutes from './routes/posts.js';
import schedulesRoutes from './routes/schedules.js';
import { subscriptionRouter, webhookRouter } from './routes/subscriptionRoutes.js';

export function createApp() {
  const app = express();

  // CORS configuration for deployment
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true
    })
  );

  // Use JSON body parser for all routes except webhook (which needs raw body for signature verification)
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/webhook')) {
      return next();
    }
    return express.json()(req, res, next);
  });

  // Auth, subscription and generation routes
  app.use('/api/auth', authRoutes);
  app.use('/api/subscription', subscriptionRouter);
  app.use('/api', generateRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/schedules', schedulesRoutes);
  app.use('/webhook', webhookRouter);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'PostAI Backend API',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api'
      },
      timestamp: new Date().toISOString()
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Main API endpoint (simple status)
  app.get('/api', (req, res) => {
    res.json({
      message: 'Backend working!',
      timestamp: new Date().toISOString()
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
