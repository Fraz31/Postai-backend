import express from 'express';
import { generateContent, enrichContent } from '../controllers/generateController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireActiveSubscription, checkSubscriptionRateLimit } from '../middleware/subscription.js';

const router = express.Router();

router.post('/generate', requireAuth, requireActiveSubscription, checkSubscriptionRateLimit, generateContent);
router.post('/enrich', requireAuth, requireActiveSubscription, checkSubscriptionRateLimit, enrichContent);

export default router;
