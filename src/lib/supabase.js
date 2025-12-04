import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

// Initialize Supabase client
// This is optional - only if SUPABASE_URL and SUPABASE_ANON_KEY are provided
export const supabase = (env.SUPABASE_URL && env.SUPABASE_ANON_KEY)
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

export const supabaseAdmin = (env.SUPABASE_URL && env.supabase.serviceRoleKey)
  ? createClient(env.SUPABASE_URL, env.supabase.serviceRoleKey)
  : null;
