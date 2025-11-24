import User from '../models/User.js';
import { lemonClient, getVariantIdForPlan } from '../config/lemon.js';
import { validateLemonWebhook } from '../utils/webhookValidator.js';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export async function createCheckout(req, res, next) {
  try {
    const { plan } = req.body || {};

    if (!plan || !['pro', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const variantId = getVariantIdForPlan(plan);

    const response = await lemonClient.post('/checkouts', {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_options: {
            embed: true,
            media: false
          },
          product_options: {
            redirect_url: `${process.env.FRONTEND_URL}/#dashboard`
          }
        },
        relationships: {
          store: {
            data: { type: 'stores', id: process.env.LEMON_STORE_ID }
          },
          variant: {
            data: { type: 'variants', id: variantId }
          }
        }
      }
    });

    const url = response.data?.data?.attributes?.url;

    return res.json({ success: true, url });
  } catch (error) {
    return next(error);
  }
}

export async function getSubscription(req, res, next) {
  try {
    const user = req.user;

    return res.json({
      success: true,
      subscription: {
        plan: user.subscriptionPlan || 'free',
        status: user.subscriptionStatus || 'inactive',
        renewsAt: user.subscriptionRenewsAt || null,
        dailyCredits: user.dailyCredits || { date: null, used: 0 }
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');
    const signature = req.headers['x-signature'] || req.headers['x-signature'] || req.headers['X-Signature'];

    const valid = validateLemonWebhook(rawBody, signature);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(rawBody);
    const data = payload.data;
    const attributes = data?.attributes || {};
    const email = attributes.user_email || attributes.email;
    const status = attributes.status;
    const renewsAt = attributes.renews_at ? new Date(attributes.renews_at) : null;
    const variantId = data?.relationships?.variant?.data?.id;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Missing user email in webhook' });
    }

    let subscriptionPlan = 'free';
    if (variantId && String(variantId) === String(process.env.LEMON_VARIANT_PRO)) {
      subscriptionPlan = 'pro';
    } else if (variantId && String(variantId) === String(process.env.LEMON_VARIANT_PREMIUM)) {
      subscriptionPlan = 'premium';
    }

    let subscriptionStatus = 'inactive';
    if (status === 'paid' || status === 'active') {
      subscriptionStatus = 'active';
    } else if (status === 'cancelled' || status === 'canceled') {
      subscriptionStatus = 'canceled';
    } else if (status === 'expired') {
      subscriptionStatus = 'expired';
    }

    const today = getToday();

    await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        subscriptionPlan,
        subscriptionStatus,
        subscriptionRenewsAt: renewsAt,
        dailyCredits: {
          date: today,
          used: 0
        }
      },
      { upsert: true }
    );

    return res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    return next(error);
  }
}
