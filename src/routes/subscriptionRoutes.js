import express from 'express';
import { createCheckout, getSubscription, handleWebhook } from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/auth.js';

const subscriptionRouter = express.Router();
const webhookRouter = express.Router();

// Authenticated subscription routes
subscriptionRouter.post('/create-checkout', requireAuth, createCheckout);
subscriptionRouter.get('/me', requireAuth, getSubscription);

// Webhook route (no auth, raw body for signature validation)
webhookRouter.post('/', express.raw({ type: 'application/json' }), handleWebhook);

export { subscriptionRouter, webhookRouter };
