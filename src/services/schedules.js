import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export async function createSchedule(userId, { post_id, platforms, scheduled_time }) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .insert({
        user_id: userId,
        post_id,
        platforms,
        scheduled_time,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Create schedule error', { userId, error: error.message });
    throw error;
  }
}

export async function getUserSchedules(userId, limit = 50, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('schedules')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { schedules: data || [], total: count || 0 };
  } catch (error) {
    logger.error('Get schedules error', { userId, error: error.message });
    throw error;
  }
}

export async function getSchedule(userId, scheduleId) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Schedule not found');
    return data;
  } catch (error) {
    logger.error('Get schedule error', { userId, scheduleId, error: error.message });
    throw error;
  }
}

export async function updateSchedule(userId, scheduleId, updates) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Update schedule error', { userId, scheduleId, error: error.message });
    throw error;
  }
}

export async function deleteSchedule(userId, scheduleId) {
  try {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Delete schedule error', { userId, scheduleId, error: error.message });
    throw error;
  }
}

export async function getPendingSchedules() {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', new Date().toISOString());

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Get pending schedules error', { error: error.message });
    throw error;
  }
}
