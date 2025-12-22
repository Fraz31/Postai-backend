import crypto from 'crypto';
import User from '../models/User.js';
import { env } from '../config/env.js';

/**
 * Paddle Webhook Handler
 * Handles subscription_created and subscription_cancelled events from Paddle
 */
export async function paddleWebhook(req, res) {
  try {
    const signature = req.headers['paddle-signature'];
    const rawBody = req.rawBody || req.body.toString();

    // Validate webhook signature
    const expected = crypto
      .createHmac('sha256', env.PADDLE_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    if (signature !== expected) {
      console.warn('[Paddle Webhook] Invalid signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event.event_type;

    console.log(`[Paddle Webhook] Received event: ${eventType}`);

    if (eventType === 'subscription_created' || eventType === 'subscription.created') {
      const customerEmail = event.data?.customer?.email;
      const priceName = event.data?.items?.[0]?.price?.name?.toLowerCase() || 'starter';
      const nextBilledAt = event.data?.next_billed_at;

      if (!customerEmail) {
        console.warn('[Paddle Webhook] Missing customer email');
        return res.status(400).json({ success: false, message: 'Missing customer email' });
      }

      // Map price name to plan
      let subscriptionPlan = 'starter';
      if (priceName.includes('pro')) {
        subscriptionPlan = 'pro';
      } else if (priceName.includes('business')) {
        subscriptionPlan = 'business';
      }

      await User.findOneAndUpdate(
        { email: customerEmail.toLowerCase().trim() },
        {
          subscriptionPlan,
          subscriptionStatus: 'active',
          subscriptionRenewsAt: nextBilledAt ? new Date(nextBilledAt) : null
        },
        { upsert: false }
      );

      console.log(`[Paddle Webhook] Subscription created for ${customerEmail}: ${subscriptionPlan}`);
    }

    if (eventType === 'subscription_cancelled' || eventType === 'subscription.cancelled') {
      const customerEmail = event.data?.customer?.email;

      if (customerEmail) {
        await User.findOneAndUpdate(
          { email: customerEmail.toLowerCase().trim() },
          { subscriptionStatus: 'cancelled' }
        );
        console.log(`[Paddle Webhook] Subscription cancelled for ${customerEmail}`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Paddle Webhook] Error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Get current user's subscription status
 */
export async function getSubscription(req, res, next) {
  try {
    const user = req.user;

    // Define plan limits
    const planLimits = {
      starter: { postsPerMonth: 50 },
      pro: { postsPerMonth: 300 },
      business: { postsPerMonth: Infinity }
    };

    const currentPlan = user.subscriptionPlan || 'starter';
    const limits = planLimits[currentPlan] || planLimits.starter;

    return res.json({
      success: true,
      subscription: {
        plan: currentPlan,
        status: user.subscriptionStatus || 'active',
        renewsAt: user.subscriptionRenewsAt || null,
        dailyCredits: user.dailyCredits || { date: null, used: 0 },
        limits
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Check if user has remaining posts available based on their plan
 */
export function checkPostLimit(user) {
  const planLimits = {
    starter: 50,
    pro: 300,
    business: Infinity
  };

  const plan = user.subscriptionPlan || 'starter';
  const limit = planLimits[plan] || 50;
  const used = user.dailyCredits?.used || 0;

  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
    limit
  };
}
