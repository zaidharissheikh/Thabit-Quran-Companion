import { cacheGet, cacheSet, quranCacheTtl } from '../../../_lib/cache.js';
import { createHandler, sendJson } from '../../../_lib/handler.js';
import { quranFetch } from '../../../_lib/quranClient.js';
import { rateLimitQuranIp } from '../../../_lib/rateLimit.js';
import {
  chapterIdSchema,
  versesQuerySchema,
} from '../../../_lib/schemas/quran.js';
import { parseOrThrow } from '../../../_lib/validate.js';

export default createHandler({
  methods: ['GET'],
  async handler(req, res) {
    await rateLimitQuranIp(req);

    const { id } = parseOrThrow(chapterIdSchema, { id: req.query?.id });
    const query = parseOrThrow(versesQuerySchema, req.query || {});
    const translationId =
      query.translations ||
      Number(process.env.QURAN_TRANSLATION_ID || 131);

    const cacheKey = `quran:verses:${id}:t${translationId}:p${query.page}:pp${query.per_page}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      sendJson(res, 200, { ...cached, cached: true });
      return;
    }

    const data = await quranFetch(`/content/api/v4/verses/by_chapter/${id}`, {
      language: 'en',
      words: 'false',
      translations: translationId,
      page: query.page,
      per_page: query.per_page,
    });

    const payload = {
      verses: data.verses || data,
      pagination: data.pagination || null,
      chapterId: id,
      translationId,
    };

    await cacheSet(cacheKey, 'quran', payload, quranCacheTtl('verses'));
    sendJson(res, 200, { ...payload, cached: false });
  },
});
