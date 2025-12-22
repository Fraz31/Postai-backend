import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Validate Paddle webhook signature using HMAC-SHA256
 * @param {string} rawBody - The raw request body as a string
 * @param {string} signature - The signature from paddle-signature header
 * @returns {boolean} - Whether the signature is valid
 */
export function validatePaddleWebhook(rawBody, signature) {
  if (!signature || !env.PADDLE_WEBHOOK_SECRET) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', env.PADDLE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return signature === expected;
}
