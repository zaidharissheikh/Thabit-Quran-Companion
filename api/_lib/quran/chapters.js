import { cacheGet, cacheSet, quranCacheTtl } from '../cache.js';
import { createHandler, sendJson } from '../handler.js';
import { quranFetch } from '../quranClient.js';
import { rateLimitQuranIp } from '../rateLimit.js';

const CACHE_KEY = 'quran:chapters';

export default createHandler({
  methods: ['GET'],
  async handler(req, res) {
    await rateLimitQuranIp(req);

    const cached = await cacheGet(CACHE_KEY);
    if (cached) {
      sendJson(res, 200, { ...cached, cached: true });
      return;
    }

    const data = await quranFetch('/content/api/v4/chapters');
    const payload = { chapters: data.chapters || data };
    await cacheSet(CACHE_KEY, 'quran', payload, quranCacheTtl('chapters'));
    sendJson(res, 200, { ...payload, cached: false });
  },
});
