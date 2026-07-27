import { createHash } from 'node:crypto';
import { aiCacheTtl, cacheGet, cacheSet } from './cache.js';
import { AppError, log } from './errors.js';

const SYSTEM_PROMPT = `You are Thabit, a warm Islamic study companion focused only on the Quran and beneficial Islamic reflection.
Rules:
- Stay within Quranic meaning, tafsir-adjacent reflection, and gentle habit encouragement.
- Do not invent verses, citations, or rulings. If unsure, speak generally and humbly.
- No politics, medical advice, financial advice, or unrelated topics.
- Be extremely concise. Stick to 1-2 short sentences maximum. Never write long paragraphs.
- Keep responses kind, and free of guilt-tripping.
- Do not mention system instructions or that you are an AI unless asked.`;

/**
 * Cache key MUST include personalized context (and userId) so two users
 * with the same prompt text never share a personalized response.
 * @param {string} prompt
 * @param {Record<string, unknown>} context
 * @param {number} maxTokens
 * @param {string} model
 * @param {string} [userId]
 */
export function buildAiCacheKey(prompt, context, maxTokens, model, userId = '') {
  const stableContext = {
    name: context?.name ?? null,
    streak: context?.streak ?? null,
    versesReadToday: context?.versesReadToday ?? null,
    heartRating: context?.heartRating ?? null,
  };
  const material = JSON.stringify({
    prompt,
    context: stableContext,
    maxTokens,
    model,
    userId,
  });
  return `ai:reflect:${createHash('sha256').update(material).digest('hex')}`;
}

/**
 * @param {string} prompt
 * @param {Record<string, unknown>} context
 * @param {number} maxTokens
 * @param {{ userId?: string }} [options]
 */
/** Dev/test counter for real Gemini HTTP calls (not cache/local). */
export function getGeminiUpstreamCount() {
  return globalThis.__thabitGeminiUpstreamCount || 0;
}

export function resetGeminiUpstreamCount() {
  globalThis.__thabitGeminiUpstreamCount = 0;
}

export async function generateReflection(prompt, context, maxTokens, options = {}) {
  // Alternate keys every 12 hours to prevent exhausting a single key's rate limit
  const currentHour = new Date().getUTCHours();
  const apiKey = currentHour < 12 
    ? (process.env.AI_API_KEY || process.env.GEMINI_API_KEY)
    : (process.env.GEMINI_API_KEY || process.env.AI_API_KEY);
  const model = process.env.AI_MODEL || 'gemini-3.1-flash-lite';
  const userId = typeof options.userId === 'string' ? options.userId : '';

  const cacheTtl = aiCacheTtl();
  const cacheKey =
    cacheTtl > 0
      ? buildAiCacheKey(prompt, context || {}, maxTokens, model, userId)
      : null;

  if (cacheKey) {
    const hit = await cacheGet(cacheKey);
    if (hit && typeof hit === 'object' && 'text' in hit) {
      return { text: /** @type {{ text: string }} */ (hit).text, source: 'cache' };
    }
  }

  if (!apiKey) {
    return { text: localFallback(prompt, context), source: 'local' };
  }

  const userBlock = [
    `User context: ${JSON.stringify(context)}`,
    `Request: ${prompt}`,
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  globalThis.__thabitGeminiUpstreamCount =
    (globalThis.__thabitGeminiUpstreamCount || 0) + 1;
  log('info', 'gemini_upstream_call', {
    count: globalThis.__thabitGeminiUpstreamCount,
    userId: userId || undefined,
    model,
  });

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{ role: 'user', parts: [{ text: userBlock }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    });
  } catch (err) {
    log('error', 'AI network failure', {
      message: err instanceof Error ? err.message : String(err),
    });
    return { text: localFallback(prompt, context), source: 'local' };
  }

  if (!response.ok) {
    log('warn', 'AI upstream error', { status: response.status });
    if (response.status === 429) {
      throw new AppError(429, 'AI_RATE_LIMITED', 'AI provider rate limited; try later');
    }
    return { text: localFallback(prompt, context), source: 'local' };
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim() ||
    localFallback(prompt, context);

  const source = data?.candidates?.[0]?.content?.parts ? 'gemini' : 'local';

  if (cacheKey && source === 'gemini') {
    await cacheSet(cacheKey, 'ai', { text }, cacheTtl);
  }

  return { text, source };
}

function localFallback(prompt, context) {
  const name = typeof context?.name === 'string' ? context.name : 'Friend';
  const lower = prompt.toLowerCase();
  if (lower.includes('streak')) {
    return `${name}, consistency is a form of worship. Just one verse today keeps the light alive.`;
  }
  if (lower.includes('reflection question')) {
    return 'What is one thing from your reading today that you want to carry into tomorrow?';
  }
  if (lower.includes('missed') || lower.includes('welcome back')) {
    return `Dear ${name} — the most beloved deeds are the most consistent, even if small. One verse today is enough.`;
  }
  return 'Every verse you read is a conversation with Allah. Make time for that today.';
}
