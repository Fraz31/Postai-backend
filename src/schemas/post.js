import { z } from 'zod';

export const createPostSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters').max(2000),
  contentType: z.enum(['post', 'article', 'email']).default('post'),
  platforms: z.array(z.string()).min(1, 'At least one platform required'),
  schedule: z.boolean().default(false),
  scheduledTime: z.string().datetime().optional()
});

export const updatePostSchema = z.object({
  text: z.string().min(1).max(5000).optional(),
  hashtags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'ready', 'published']).optional()
});

export const enrichContentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000)
});
