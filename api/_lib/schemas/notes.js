import { z } from 'zod';

export const createNoteSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  verseRef: z.string().trim().max(40).optional().nullable().default(null),
  verseLabel: z.string().trim().max(200).optional().nullable().default(null),
});

export const updateNoteSchema = createNoteSchema.partial();

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
