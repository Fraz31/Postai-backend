import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export async function registerUser(email, password, username) {
  try {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('Failed to create user');

    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email,
      username
    });

    if (profileError) throw profileError;

    return { user, message: 'Registration successful' };
  } catch (error) {
    logger.error('Registration error', { email, error: error.message });
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!session) throw new Error('Failed to create session');

    return { user, session };
  } catch (error) {
    logger.error('Login error', { email, error: error.message });
    throw error;
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Get profile error', { userId, error: error.message });
    throw error;
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Update profile error', { userId, error: error.message });
    throw error;
  }
}
