import { z } from 'zod';

export const supportContactSchema = z.object({
  topic: z.enum(['suggestion', 'bug', 'question', 'other']).default('suggestion'),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});
