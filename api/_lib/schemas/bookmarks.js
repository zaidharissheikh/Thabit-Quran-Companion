import { z } from 'zod';

export const createBookmarkSchema = z.object({
  surahId: z.coerce.number().int().min(1).max(114),
  ayahNumber: z.coerce.number().int().min(1).max(286),
  ref: z.string().trim().min(1).max(40).optional(),
  arabic: z.string().max(5000).optional().default(''),
  translation: z.string().max(8000).optional().default(''),
  surahName: z.string().max(120).optional().default(''),
});

export const updateBookmarkSchema = createBookmarkSchema.partial();

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
