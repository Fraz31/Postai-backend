import { supabase } from '../lib/supabase.js';
import { generateContent, enrichContent } from '../lib/openai.js';
import { logger } from '../lib/logger.js';

export async function createPost(userId, { prompt, contentType = 'post', platforms, schedule, scheduledTime }) {
  try {
    const content = await generateContent(prompt, contentType);

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content_type: contentType,
        text: content.text,
        hashtags: content.hashtags,
        suggestions: content.suggestions,
        original_prompt: prompt,
        status: schedule ? 'scheduled' : 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    if (schedule && scheduledTime) {
      await createSchedule(userId, {
        post_id: post.id,
        platforms,
        scheduled_time: scheduledTime
      });
    }

    return post;
  } catch (error) {
    logger.error('Create post error', { userId, error: error.message });
    throw error;
  }
}

export async function getUserPosts(userId, limit = 50, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { posts: data || [], total: count || 0 };
  } catch (error) {
    logger.error('Get posts error', { userId, error: error.message });
    throw error;
  }
}

export async function getPost(userId, postId) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Post not found');
    return data;
  } catch (error) {
    logger.error('Get post error', { userId, postId, error: error.message });
    throw error;
  }
}

export async function updatePost(userId, postId, updates) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Update post error', { userId, postId, error: error.message });
    throw error;
  }
}

export async function deletePost(userId, postId) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Delete post error', { userId, postId, error: error.message });
    throw error;
  }
}

export async function enrichPostContent(userId, content) {
  try {
    const enrichmentData = await enrichContent(content);

    const { data: enrichment, error } = await supabase
      .from('content_enrichments')
      .insert({
        user_id: userId,
        original_content: content,
        enriched_content: enrichmentData.enriched,
        engagement_score: enrichmentData.score
      })
      .select()
      .single();

    if (error) throw error;
    return enrichment;
  } catch (error) {
    logger.error('Enrich content error', { userId, error: error.message });
    throw error;
  }
}

async function createSchedule(userId, { post_id, platforms, scheduled_time }) {
  const { error } = await supabase
    .from('schedules')
    .insert({
      user_id: userId,
      post_id,
      platforms,
      scheduled_time,
      status: 'pending'
    });

  if (error) throw error;
}
