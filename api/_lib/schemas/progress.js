import { z } from 'zod';

const sessionSchema = z.object({
  date: z.string().min(1).max(40),
  verses: z.number().int().min(0).max(10000),
  heart: z.number().int().min(0).max(5),
});

const dailyTextSchema = z.object({
  date: z.union([z.string().max(40), z.null()]).optional().default(null),
  text: z.string().max(2000).optional().default(''),
});

export const progressUpdateSchema = z.object({
  goal: z.number().int().min(1).max(100).optional(),
  streak: z.number().int().min(0).max(100000).optional(),
  versesReadToday: z.number().int().min(0).max(10000).optional(),
  lastReadDate: z.string().max(40).optional(),
  heartRating: z.number().int().min(0).max(5).optional(),
  ramadanVerses: z.number().int().min(0).max(100000).optional(),
  sessions: z.array(sessionSchema).max(60).optional(),
  dailyNudge: dailyTextSchema.optional(),
  dailyReflection: dailyTextSchema.optional(),
});

/** Sensible defaults when a user has no progress document yet. */
export function defaultProgress(name = 'Friend') {
  const today = new Date().toISOString().split('T')[0];
  return {
    name,
    goal: 10,
    streak: 0,
    versesReadToday: 0,
    lastReadDate: today,
    heartRating: 3,
    ramadanVerses: 0,
    sessions: [],
    dailyNudge: { date: null, text: '' },
    dailyReflection: { date: null, text: '' },
  };
}
