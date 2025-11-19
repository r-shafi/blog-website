import { z } from 'zod';

export const articleSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters long' })
    .max(100, { message: 'Title must be less than 100 characters' }),

  excerpt: z
    .string()
    .min(10, { message: 'Excerpt must be at least 10 characters long' })
    .max(300, { message: 'Excerpt must be less than 300 characters' }),

  category_id: z.string().min(1, { message: 'Please select a category' }),

  tag_ids: z.array(z.string()).default([]).optional(),

  featured_image: z.instanceof(File).nullable().optional(),

  status: z
    .enum(['draft', 'pending', 'published'])
    .default('pending')
    .optional(),
});
