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

const preferencesSchema = z.object({
  avatarId: z.string().max(40).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  fontSize: z.number().int().min(1).max(5).optional(),
  stickerPack: z.enum(['girl', 'boy']).optional(),
  favoriteSurahIds: z
    .array(z.number().int().min(1).max(114))
    .max(114)
    .optional(),
});

/** Per-day unique ayah keys, e.g. { "2026-07-27": ["1:1", "2:255"] } */
const readLogsSchema = z
  .record(z.array(z.string().max(24)).max(624))
  .optional();

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
  moodHistory: z.record(z.number().int().min(1).max(5)).optional(),
  readLogs: readLogsSchema,
  preferences: preferencesSchema.optional(),
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
    moodHistory: {},
    readLogs: {},
    preferences: {},
  };
}
