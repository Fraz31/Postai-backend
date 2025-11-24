import axios from 'axios';
import { env } from './env.js';

export const lemonClient = axios.create({
  baseURL: 'https://api.lemonsqueezy.com/v1',
  headers: {
    Authorization: `Bearer ${env.LEMON_API_KEY}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json'
  }
});

export function getVariantIdForPlan(plan) {
  if (plan === 'pro') return env.LEMON_VARIANT_PRO;
  if (plan === 'premium') return env.LEMON_VARIANT_PREMIUM;
  throw new Error('Invalid plan');
}
