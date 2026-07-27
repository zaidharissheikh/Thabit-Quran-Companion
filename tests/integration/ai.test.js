import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import reflectHandler from '../../api/ai/reflect.js';
import * as aiClient from '../../api/_lib/aiClient.js';
import {
  ALLOWED_ORIGIN,
  invoke,
} from '../helpers/http.js';
import { registerUser } from '../helpers/session.js';

vi.mock('../../api/_lib/aiClient.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateReflection: vi.fn(actual.generateReflection),
  };
});

describe('integration: ai', () => {
  beforeEach(() => {
    vi.mocked(aiClient.generateReflection).mockClear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'A gentle reflection from the mock model.' }],
              },
            },
          ],
        }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requires auth', async () => {
    const res = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: { prompt: 'Give a short reflection' },
    });
    expect(res.status).toBe(401);
    expect(aiClient.generateReflection).not.toHaveBeenCalled();
  });

  it('returns a response via the AI client for a valid authed request', async () => {
    const session = await registerUser();
    vi.mocked(aiClient.generateReflection).mockResolvedValueOnce({
      text: 'Mocked reflection text',
      source: 'gemini',
    });

    const res = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: {
        prompt: 'Write one gentle reflection question.',
        context: { name: 'Amina', streak: 2 },
      },
    });

    expect(res.status).toBe(200);
    expect(res.json.text).toBe('Mocked reflection text');
    expect(aiClient.generateReflection).toHaveBeenCalledTimes(1);
  });

  it('rate limits per user; a different user is unaffected', async () => {
    const limit = Number(process.env.AI_RATE_LIMIT_PER_HOUR);
    expect(limit).toBeGreaterThan(0);

    const userA = await registerUser({ name: 'RateA' });
    const userB = await registerUser({ name: 'RateB' });

    vi.mocked(aiClient.generateReflection).mockResolvedValue({
      text: 'ok',
      source: 'gemini',
    });

    for (let i = 0; i < limit; i += 1) {
      const res = await invoke(reflectHandler, {
        method: 'POST',
        headers: { origin: ALLOWED_ORIGIN },
        cookies: userA.cookies,
        body: { prompt: `prompt ${i}` },
      });
      expect(res.status).toBe(200);
    }

    const blocked = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      body: { prompt: 'one more' },
    });
    expect(blocked.status).toBe(429);
    expect(blocked.json.error.code).toBe('RATE_LIMITED');

    const other = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userB.cookies,
      body: { prompt: 'fresh user prompt' },
    });
    expect(other.status).toBe(200);
  });

  it('isolates AI cache by userId for identical prompt+context', async () => {
    const userA = await registerUser({ name: 'CacheA' });
    const userB = await registerUser({ name: 'CacheB' });

    // Use real generateReflection (wrapped) so Mongo AI cache + key logic run.
    vi.mocked(aiClient.generateReflection).mockImplementation(
      async (...args) => {
        const actual = await vi.importActual('../../api/_lib/aiClient.js');
        return actual.generateReflection(...args);
      },
    );

    const payload = {
      prompt: 'Identical prompt for cache isolation',
      context: { name: 'Shared', streak: 3, versesReadToday: 1, heartRating: 4 },
      maxTokens: 120,
    };

    const a1 = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      body: payload,
    });
    expect(a1.status).toBe(200);

    const a2 = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      body: payload,
    });
    expect(a2.status).toBe(200);
    expect(a2.json.source).toBe('cache');

    const b1 = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userB.cookies,
      body: payload,
    });
    expect(b1.status).toBe(200);
    expect(b1.json.source).not.toBe('cache');

    // generateReflection invoked for A miss, A hit (still enters fn, cache inside),
    // and B miss - assert Gemini fetch only twice (A + B), not shared.
    const geminiCalls = vi.mocked(fetch).mock.calls.filter(([url]) =>
      String(url).includes('generativelanguage.googleapis.com'),
    );
    expect(geminiCalls).toHaveLength(2);
  });

  it('rejects invalid input with 400 before calling the AI client', async () => {
    const session = await registerUser();
    vi.mocked(aiClient.generateReflection).mockClear();

    const res = await invoke(reflectHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { prompt: 'x'.repeat(2001) },
    });

    expect(res.status).toBe(400);
    expect(res.json.error.code).toBe('VALIDATION_ERROR');
    expect(aiClient.generateReflection).not.toHaveBeenCalled();
  });
});
