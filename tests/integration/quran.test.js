import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import chaptersHandler from '../../api/quran/chapters.js';
import chapterHandler from '../../api/quran/chapters/[id].js';
import { clearQfTokenCache, qfTokenFetcher, quranFetch } from '../../api/_lib/quranClient.js';
import { invoke } from '../helpers/http.js';

vi.mock('../../api/_lib/quranClient.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    quranFetch: vi.fn(actual.quranFetch),
  };
});

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe('integration: quran', () => {
  beforeEach(() => {
    clearQfTokenCache();
    vi.mocked(quranFetch).mockClear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input) => {
        const url = String(input);
        if (url.includes('/oauth2/token')) {
          return jsonResponse({ access_token: 'test-access-token', expires_in: 3600 });
        }
        if (url.includes('/chapters/') && url.includes('/verses')) {
          return jsonResponse({ verses: [] });
        }
        if (url.match(/\/chapters\/\d+/)) {
          return jsonResponse({ chapter: { id: 1, name_simple: 'Al-Fatihah' } });
        }
        if (url.includes('/chapters')) {
          return jsonResponse({
            chapters: [{ id: 1, name_simple: 'Al-Fatihah' }],
          });
        }
        return jsonResponse({ error: 'unexpected' }, 500);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(quranFetch).mockReset();
    // Re-bind to real implementation by default (individual tests override).
    vi.mocked(quranFetch).mockImplementation(async (...args) => {
      const actual = await vi.importActual('../../api/_lib/quranClient.js');
      return actual.quranFetch(...args);
    });
  });

  it('GET /api/quran/chapters succeeds without auth', async () => {
    vi.mocked(quranFetch).mockResolvedValueOnce({
      chapters: [{ id: 1, name_simple: 'Al-Fatihah' }],
    });

    const res = await invoke(chaptersHandler, { method: 'GET' });
    expect(res.status).toBe(200);
    expect(res.json.chapters[0].name_simple).toBe('Al-Fatihah');
    expect(res.json.cached).toBe(false);
  });

  it('second call within TTL is a cache hit (quranFetch not called again)', async () => {
    vi.mocked(quranFetch).mockResolvedValue({
      chapters: [{ id: 1, name_simple: 'Al-Fatihah' }],
    });

    const first = await invoke(chaptersHandler, { method: 'GET' });
    expect(first.status).toBe(200);
    expect(first.json.cached).toBe(false);
    expect(quranFetch).toHaveBeenCalledTimes(1);

    const second = await invoke(chaptersHandler, { method: 'GET' });
    expect(second.status).toBe(200);
    expect(second.json.cached).toBe(true);
    expect(quranFetch).toHaveBeenCalledTimes(1);
  });

  it('IP rate limits after QURAN_RATE_LIMIT_PER_WINDOW', async () => {
    const limit = Number(process.env.QURAN_RATE_LIMIT_PER_WINDOW);
    expect(limit).toBeGreaterThan(0);

    vi.mocked(quranFetch).mockResolvedValue({
      chapters: [{ id: 1, name_simple: 'Al-Fatihah' }],
    });

    const ip = '198.51.100.10';
    for (let i = 0; i < limit; i += 1) {
      const res = await invoke(chaptersHandler, {
        method: 'GET',
        headers: { 'x-forwarded-for': ip },
      });
      expect(res.status).toBe(200);
    }

    const blocked = await invoke(chaptersHandler, {
      method: 'GET',
      headers: { 'x-forwarded-for': ip },
    });
    expect(blocked.status).toBe(429);
    expect(blocked.json.error.code).toBe('RATE_LIMITED');
  });

  it('caches OAuth token — fetchQfToken only once across content requests', async () => {
    // Use real quranFetch path (unwrap mock) for this token-cache assertion.
    const { quranFetch: realFetch } = await vi.importActual('../../api/_lib/quranClient.js');
    vi.mocked(quranFetch).mockImplementation(realFetch);

    const tokenSpy = vi
      .spyOn(qfTokenFetcher, 'fetch')
      .mockResolvedValue({ accessToken: 'cached-token', expiresIn: 3600 });

    // Bypass Mongo content cache by using two distinct endpoints / cold cache already cleared.
    const a = await invoke(chaptersHandler, { method: 'GET' });
    const b = await invoke(chapterHandler, {
      method: 'GET',
      query: { id: '1' },
    });

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(tokenSpy).toHaveBeenCalledTimes(1);
  });
});
