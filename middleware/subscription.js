export function requirePro(req, res, next) {
  if (
    req.user &&
    req.user.subscriptionStatus === 'active' &&
    (req.user.subscriptionPlan === 'pro' || req.user.subscriptionPlan === 'premium')
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Upgrade required' });
}
