import { ApiError, aiApi } from '../lib/api';

/**
 * Server-side AI reflection via POST /api/ai/reflect.
 * @param {string} prompt
 * @param {{ name?: string, streak?: number, versesReadToday?: number, heartRating?: number }} context
 * @param {number} [maxTokens]
 * @returns {Promise<string>}
 */
export async function askAi(prompt, context = {}, maxTokens = 180) {
  try {
    const data = await aiApi.reflect({
      prompt,
      context: {
        name: context.name,
        streak: context.streak,
        versesReadToday: context.versesReadToday,
        heartRating: context.heartRating,
      },
      maxTokens,
    });
    return data?.text || fallback(prompt, context);
  } catch (err) {
    if (err instanceof ApiError && err.isRateLimited) {
      return 'Please try again in a little while - the reflection helper is resting.';
    }
    return fallback(prompt, context);
  }
}

function fallback(prompt, context) {
  const name = context?.name || 'Friend';
  const lower = prompt.toLowerCase();
  if (lower.includes('streak')) {
    return `${name}, consistency is a form of worship. Just one verse today keeps the light alive.`;
  }
  if (lower.includes('reflection question')) {
    return 'What is one thing from your reading today that you want to carry into tomorrow?';
  }
  if (lower.includes('missed') || lower.includes('welcome back')) {
    return `Dear ${name} - the most beloved deeds are the most consistent, even if small. One verse today is enough.`;
  }
  return 'Every verse you read is a conversation with Allah. Make time for that today.';
}
