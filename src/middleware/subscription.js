import User from '../models/User.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function requireActiveSubscription(req, res, next) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  if (user.subscriptionPlan === 'free') {
    // Free plan is allowed but rate-limited; handled in rate limiter
    return next();
  }

  if (user.subscriptionStatus !== 'active') {
    return res.status(403).json({ success: false, message: 'Subscription inactive or expired' });
  }

  return next();
}

export async function checkSubscriptionRateLimit(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const plan = user.subscriptionPlan || 'free';
    const limits = {
      free: 5,
      pro: 50,
      premium: Infinity
    };

    const limit = limits[plan] ?? 5;
    const todayStr = today();

    let daily = user.dailyCredits || { date: todayStr, used: 0 };

    if (daily.date !== todayStr) {
      daily = { date: todayStr, used: 0 };
    }

    if (Number.isFinite(limit) && daily.used >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Daily generation limit reached for your plan'
      });
    }

    // Increment and persist
    daily.used += 1;
    user.dailyCredits = daily;
    await user.save();

    return next();
  } catch (error) {
    return next(error);
  }
}
