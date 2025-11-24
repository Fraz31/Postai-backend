import crypto from 'crypto';
import { env } from '../config/env.js';

export function validateLemonWebhook(rawBody, signature) {
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', env.LEMON_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex');

  return signature === expected;
}
