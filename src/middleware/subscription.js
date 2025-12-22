import User from '../models/User.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Plan limits: Starter = 50, Pro = 300, Business = unlimited
const PLAN_LIMITS = {
  starter: 50,
  pro: 300,
  business: Infinity
};

export function requireActiveSubscription(req, res, next) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  // All plans are allowed (starter is the default plan)
  // Check if subscription is cancelled
  if (user.subscriptionStatus === 'cancelled') {
    return res.status(403).json({
      success: false,
      message: 'Your subscription has been cancelled. Please resubscribe to continue.'
    });
  }

  return next();
}

export async function checkSubscriptionRateLimit(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const plan = user.subscriptionPlan || 'starter';
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter;
    const todayStr = today();

    // Get current month usage instead of daily for monthly limits
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    let monthlyUsage = user.dailyCredits || { date: currentMonth, used: 0 };

    // Reset if it's a new month
    if (!monthlyUsage.date || monthlyUsage.date.slice(0, 7) !== currentMonth) {
      monthlyUsage = { date: currentMonth, used: 0 };
    }

    if (Number.isFinite(limit) && monthlyUsage.used >= limit) {
      return res.status(429).json({
        success: false,
        message: `Monthly generation limit (${limit} posts) reached for your ${plan} plan. Upgrade to get more!`,
        limit,
        used: monthlyUsage.used,
        plan
      });
    }

    // Increment and persist
    monthlyUsage.used += 1;
    user.dailyCredits = monthlyUsage;
    await user.save();

    return next();
  } catch (error) {
    return next(error);
  }
}
