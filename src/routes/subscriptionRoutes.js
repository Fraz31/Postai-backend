import express from 'express';
import { paddleWebhook, getSubscription } from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/auth.js';

const subscriptionRouter = express.Router();
const webhookRouter = express.Router();

// Authenticated subscription routes
subscriptionRouter.get('/me', requireAuth, getSubscription);

// Paddle webhook route (no auth, raw body for signature validation)
// Note: Raw body parsing is handled in app.js for /api/webhooks path
webhookRouter.post('/paddle', paddleWebhook);

export { subscriptionRouter, webhookRouter };
