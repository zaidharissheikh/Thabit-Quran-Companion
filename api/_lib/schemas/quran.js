import { z } from 'zod';

export const chapterIdSchema = z.object({
  id: z.coerce.number().int().min(1).max(114),
});

export const versesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(50),
  translations: z.coerce.number().int().positive().optional(),
});
