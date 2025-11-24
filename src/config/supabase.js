import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Supabase is optional for PostAI. This module reads SUPABASE_URL and
// SUPABASE_ANON_KEY from env (no VITE_*), matching the recommended pattern.
// Backend will still boot even if these are not set; just avoid using
// Supabase-dependent features until configured.

const supabaseUrl = env.SUPABASE_URL || 'https://abmeeofcgjoyrgxdnmqu.supabase.co';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TODO: Wire supabase into specific features (analytics, history, etc.) when needed.
