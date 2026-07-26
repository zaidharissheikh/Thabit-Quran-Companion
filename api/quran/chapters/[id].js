import { cacheGet, cacheSet, quranCacheTtl } from '../../_lib/cache.js';
import { createHandler, sendJson } from '../../_lib/handler.js';
import { quranFetch } from '../../_lib/quranClient.js';
import { rateLimitQuranIp } from '../../_lib/rateLimit.js';
import { chapterIdSchema } from '../../_lib/schemas/quran.js';
import { parseOrThrow } from '../../_lib/validate.js';

export default createHandler({
  methods: ['GET'],
  async handler(req, res) {
    await rateLimitQuranIp(req);

    const { id } = parseOrThrow(chapterIdSchema, { id: req.query?.id });
    const cacheKey = `quran:chapter:${id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      sendJson(res, 200, { ...cached, cached: true });
      return;
    }

    const data = await quranFetch(`/content/api/v4/chapters/${id}`);
    const payload = { chapter: data.chapter || data };
    await cacheSet(cacheKey, 'quran', payload, quranCacheTtl('chapters'));
    sendJson(res, 200, { ...payload, cached: false });
  },
});
