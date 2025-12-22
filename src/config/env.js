import 'dotenv/config';

// Resolve environment variables used by the PostAI backend.
// Using Paddle for payment processing.

const appResolved = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET
};

// Optional Supabase config for backend usage (server-side only).
const supabaseConfig = {
  url: process.env.SUPABASE_URL || null,
  anonKey: process.env.SUPABASE_ANON_KEY || null
};

// Core required vars (excluding optional Paddle secret for local dev)
const coreRequired = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'];
const missing = coreRequired.filter((key) => !appResolved[key]);

if (missing.length > 0) {
  console.error('\n[PostAI Backend] Missing required environment variables:');
  missing.forEach((key) => console.error(`- ${key}`));
  console.error('\nPlease set these in your Render dashboard or .env file before starting the server.');
  process.exit(1);
}

// Warn if Paddle webhook secret is missing (needed for production)
if (!appResolved.PADDLE_WEBHOOK_SECRET) {
  console.warn('[PostAI Backend] Warning: PADDLE_WEBHOOK_SECRET not set. Webhook validation will fail in production.');
}

export const env = {
  ...appResolved,
  supabase: supabaseConfig,
  SUPABASE_URL: supabaseConfig.url,
  SUPABASE_ANON_KEY: supabaseConfig.anonKey,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000
};
