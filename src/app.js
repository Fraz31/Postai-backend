import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import generateRoutes from './routes/generateRoutes.js';
import postsRoutes from './routes/posts.js';
import schedulesRoutes from './routes/schedules.js';
import { subscriptionRouter, webhookRouter } from './routes/subscriptionRoutes.js';
import { initScheduler } from './services/scheduler.js';

export function createApp() {
  const app = express();

  // Start Scheduler
  initScheduler();

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

  // Paddle webhook needs raw body for signature validation
  // MUST be before express.json() middleware
  app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
    // Store raw body for signature validation
    req.rawBody = req.body.toString();
    // Parse JSON for handler
    try {
      req.body = JSON.parse(req.rawBody);
    } catch (e) {
      // Keep as-is if not valid JSON
    }
    next();
  });

  // Use JSON body parser for all other routes
  app.use(express.json());

  // Auth, subscription and generation routes
  app.use('/api/auth', authRoutes);
  app.use('/api/subscription', subscriptionRouter);
  app.use('/api', generateRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/schedules', schedulesRoutes);
  app.use('/api/webhooks', webhookRouter);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'SocialMonkey Backend API',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api',
        webhooks: '/api/webhooks/paddle'
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
