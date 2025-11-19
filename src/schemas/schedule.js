import { z } from 'zod';

export const createScheduleSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  platforms: z.array(z.string()).min(1, 'At least one platform required'),
  scheduled_time: z.string().datetime('Invalid datetime format')
});

export const updateScheduleSchema = z.object({
  platforms: z.array(z.string()).optional(),
  scheduled_time: z.string().datetime().optional(),
  status: z.enum(['pending', 'published', 'failed']).optional()
});
