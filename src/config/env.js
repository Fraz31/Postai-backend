import 'dotenv/config';

// Resolve environment variables used by the PostAI backend.
// IMPORTANT:
// - Backend uses NORMAL names (no VITE_ prefix).
// - Frontend, if using Vite, should use VITE_* separately.
// - We intentionally do NOT reference any VITE_SUPABASE_* vars here.

const appResolved = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,

  // Support both new and legacy LemonSqueezy variable names
  LEMON_API_KEY: process.env.LEMON_API_KEY || process.env.LEMONSQUEEZY_API_KEY,
  LEMON_STORE_ID: process.env.LEMON_STORE_ID || process.env.LEMONSQUEEZY_STORE_ID,
  LEMON_VARIANT_PRO:
    process.env.LEMON_VARIANT_PRO || process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
  LEMON_VARIANT_PREMIUM:
    process.env.LEMON_VARIANT_PREMIUM || process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID,
  LEMON_WEBHOOK_SECRET:
    process.env.LEMON_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET
};

// Optional Supabase config for backend usage (server-side only).
// These are NOT required for the backend to boot, but if you intend to use
// Supabase features you should set them in Render as SUPABASE_URL/SUPABASE_ANON_KEY.
const supabaseConfig = {
  url: process.env.SUPABASE_URL || null,
  anonKey: process.env.SUPABASE_ANON_KEY || null
};

const missing = Object.entries(appResolved)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  // Do not remove: helpful startup error if env is misconfigured
  console.error('\n[PostAI Backend] Missing required environment variables:');
  missing.forEach((key) => console.error(`- ${key} `));
  console.error('\nPlease set these in your Render dashboard or .env file before starting the server.');
  process.exit(1);
}

export const env = {
  ...appResolved,
  supabase: supabaseConfig,
  SUPABASE_URL: supabaseConfig.url,
  SUPABASE_ANON_KEY: supabaseConfig.anonKey,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000
};
