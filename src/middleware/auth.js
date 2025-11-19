import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.slice(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Auth failed', { error: error?.message });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function validateSchema(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedData = validated;
      next();
    } catch (error) {
      const issues = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      res.status(400).json({ error: 'Validation error', issues });
    }
  };
}

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
