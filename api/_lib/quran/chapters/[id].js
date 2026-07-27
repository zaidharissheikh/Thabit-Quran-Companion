import { cacheGet, cacheSet, quranCacheTtl } from '../../cache.js';
import { createHandler, sendJson } from '../../handler.js';
import { quranFetch } from '../../quranClient.js';
import { rateLimitQuranIp } from '../../rateLimit.js';
import { chapterIdSchema } from '../../schemas/quran.js';
import { parseOrThrow } from '../../validate.js';

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
