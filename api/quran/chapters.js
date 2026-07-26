import { cacheGet, cacheSet, quranCacheTtl } from '../_lib/cache.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import { quranFetch } from '../_lib/quranClient.js';
import { rateLimitQuranIp } from '../_lib/rateLimit.js';

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
