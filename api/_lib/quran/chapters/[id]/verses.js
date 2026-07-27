import { cacheGet, cacheSet, quranCacheTtl } from '../../../cache.js';
import { createHandler, sendJson } from '../../../handler.js';
import { quranFetch } from '../../../quranClient.js';
import { rateLimitQuranIp } from '../../../rateLimit.js';
import {
  chapterIdSchema,
  versesQuerySchema,
} from '../../../schemas/quran.js';
import { parseOrThrow } from '../../../validate.js';

export default createHandler({
  methods: ['GET'],
  async handler(req, res) {
    await rateLimitQuranIp(req);

    const { id } = parseOrThrow(chapterIdSchema, { id: req.query?.id });
    const query = parseOrThrow(versesQuerySchema, req.query || {});
    // Sahih International (20) works on Quran Foundation; 131 often returns no text.
    const translationId =
      query.translations ||
      Number(process.env.QURAN_TRANSLATION_ID || 20);

    const cacheKey = `quran:verses:v2:${id}:t${translationId}:p${query.page}:pp${query.per_page}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      sendJson(res, 200, { ...cached, cached: true });
      return;
    }

    // QF omits Arabic/translations unless fields=text_uthmani is requested.
    const data = await quranFetch(`/content/api/v4/verses/by_chapter/${id}`, {
      language: 'en',
      words: 'false',
      translations: translationId,
      fields: 'text_uthmani',
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
