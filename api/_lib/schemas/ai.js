import { z } from 'zod';

export const reflectSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  maxTokens: z.coerce.number().int().min(50).max(500).optional().default(180),
  context: z
    .object({
      name: z.string().max(80).optional(),
      streak: z.number().int().min(0).max(100000).optional(),
      versesReadToday: z.number().int().min(0).max(10000).optional(),
      heartRating: z.number().int().min(0).max(5).optional(),
    })
    .optional()
    .default({}),
});
