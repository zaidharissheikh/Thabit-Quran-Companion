import { cacheGet, cacheSet, quranCacheTtl } from '../../../cache.js';
import { createHandler, sendJson } from '../../../handler.js';
import { quranFetch } from '../../../quranClient.js';
import { rateLimitQuranIp } from '../../../rateLimit.js';
import {
  chapterIdSchema,
  versesQuerySchema,
} from '../../../schemas/quran.js';
import { parseOrThrow } from '../../../validate.js';

/** Sahih International — reliably returns text on Quran Foundation prod + prelive. */
const DEFAULT_TRANSLATION_ID = 20;

/**
 * QF resource 131 often returns Arabic only (no translations[]) on production.
 * Map known-empty IDs to Sahih International so Vercel env misconfig can't blank EN.
 * @param {number} raw
 */
function resolveTranslationId(raw) {
  const id = Number(raw);
  if (!Number.isFinite(id) || id < 1) return DEFAULT_TRANSLATION_ID;
  if (id === 131) return DEFAULT_TRANSLATION_ID;
  return id;
}

/**
 * @param {unknown[]} verses
 */
function versesHaveTranslation(verses) {
  if (!Array.isArray(verses) || verses.length === 0) return false;
  const sample = verses.find((v) => v && typeof v === 'object') || {};
  return Array.isArray(sample.translations) && sample.translations.length > 0;
}

export default createHandler({
  methods: ['GET'],
  async handler(req, res) {
    await rateLimitQuranIp(req);

    const { id } = parseOrThrow(chapterIdSchema, { id: req.query?.id });
    const query = parseOrThrow(versesQuerySchema, req.query || {});
    const translationId = resolveTranslationId(
      query.translations ||
        process.env.QURAN_TRANSLATION_ID ||
        DEFAULT_TRANSLATION_ID,
    );

    // v3: bust caches that stored Arabic-only payloads from translation 131
    const cacheKey = `quran:verses:v3:${id}:t${translationId}:p${query.page}:pp${query.per_page}`;

    const cached = await cacheGet(cacheKey);
    if (cached && versesHaveTranslation(cached.verses)) {
      sendJson(res, 200, { ...cached, cached: true });
      return;
    }

    // QF omits Arabic unless fields=text_uthmani; translations= needs a working resource id.
    let data = await quranFetch(`/content/api/v4/verses/by_chapter/${id}`, {
      language: 'en',
      words: 'false',
      translations: translationId,
      fields: 'text_uthmani',
      page: query.page,
      per_page: query.per_page,
    });

    let verses = data.verses || data;
    let usedTranslationId = translationId;

    if (!versesHaveTranslation(verses) && translationId !== DEFAULT_TRANSLATION_ID) {
      data = await quranFetch(`/content/api/v4/verses/by_chapter/${id}`, {
        language: 'en',
        words: 'false',
        translations: DEFAULT_TRANSLATION_ID,
        fields: 'text_uthmani',
        page: query.page,
        per_page: query.per_page,
      });
      verses = data.verses || data;
      usedTranslationId = DEFAULT_TRANSLATION_ID;
    }

    const payload = {
      verses,
      pagination: data.pagination || null,
      chapterId: id,
      translationId: usedTranslationId,
    };

    if (versesHaveTranslation(verses)) {
      await cacheSet(cacheKey, 'quran', payload, quranCacheTtl('verses'));
    }

    sendJson(res, 200, { ...payload, cached: false });
  },
});
