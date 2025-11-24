import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');

    const signature = req.headers['x-signature'];
    const expected = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    if (!signature || signature !== expected) {
      return res.status(401).send('Invalid signature');
    }

    const payload = JSON.parse(rawBody);

    const email = payload.data?.attributes?.user_email;
    let status = payload.data?.attributes?.status;
    const variantId = payload.data?.relationships?.variant?.data?.id;

    if (status === 'paid') {
      status = 'active';
    }

    let subscriptionPlan = 'free';
    if (variantId && process.env.LEMONSQUEEZY_PRO_VARIANT_ID && variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) {
      subscriptionPlan = 'pro';
    }
    if (variantId && process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID && variantId === process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID) {
      subscriptionPlan = 'premium';
    }

    if (!email) {
      return res.status(400).send('Missing user email');
    }

    await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        subscriptionPlan,
        subscriptionStatus: status || 'active',
        subscriptionUpdated: new Date()
      },
      { upsert: true }
    );

    return res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).send('Webhook processing failed');
  }
});

export default router;
