import { logger } from '../lib/logger.js';

let requestCounts = new Map();

export function requestLogging(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous'
    });
  });

  next();
}

export function rateLimiter(windowMs = 15 * 60 * 1000, maxRequests = 100) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const timestamps = requestCounts.get(key);
    const validTimestamps = timestamps.filter(t => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { key });
      return res.status(429).json({ error: 'Too many requests' });
    }

    validTimestamps.push(now);
    requestCounts.set(key, validTimestamps);

    if (requestCounts.size > 10000) {
      requestCounts.clear();
    }

    next();
  };
}

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}
