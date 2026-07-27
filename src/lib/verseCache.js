import { quranApi } from './api'
import { normalizeQfVerses } from './quranNormalize'
import { FATIHA } from '../data/content'
import {
  chapterCacheKey,
  idbGetChapter,
  idbPutChapter,
  isChapterEntryFresh,
} from './quranIdb'
import { prefetchAyahAudio as prefetchAudio } from './ayahAudioCache'

/** Default translation id (Sahih International) - must match API default. */
export const DEFAULT_TRANSLATION_ID = 20

/** @type {Map<number, { num: number, ar: string, en: string, key?: string }[]>} */
const chapterCache = new Map()

/** @type {Map<number, Promise<{ num: number, ar: string, en: string, key?: string }[]>>} */
const inflight = new Map()

/** @type {Set<number>} chapters with a background API refresh in flight */
const refreshing = new Set()

/**
 * @param {number} chapterId
 * @returns {{ num: number, ar: string, en: string, key?: string }[] | null}
 */
export function getCachedChapterVerses(chapterId) {
  const id = Number(chapterId)
  if (id === 1 && !chapterCache.has(1)) {
    chapterCache.set(1, FATIHA.map((v) => ({ ...v })))
  }
  return chapterCache.get(id) || null
}

/**
 * @param {number} chapterId
 * @param {number} verseNum
 */
export function getCachedVerse(chapterId, verseNum) {
  const rows = getCachedChapterVerses(chapterId)
  if (!rows) return null
  return rows.find((v) => v.num === Number(verseNum)) || null
}

/**
 * @param {number} id
 * @param {{ num: number, ar: string, en: string, key?: string }[]} rows
 * @param {number} [translationId]
 */
function rememberChapter(id, rows, translationId = DEFAULT_TRANSLATION_ID) {
  if (!rows?.length) return
  chapterCache.set(id, rows)
  void idbPutChapter({
    key: chapterCacheKey(id, translationId),
    chapterId: id,
    translationId,
    verses: rows,
    fetchedAt: Date.now(),
  })
}

/**
 * Fetch all pages for a chapter from our API (→ Quran.com).
 * @param {number} id
 */
async function fetchChapterFromApi(id) {
  const all = []
  let page = 1
  let totalPages = 1

  do {
    const res = await quranApi.verses(id, { page, per_page: 300 })
    all.push(...normalizeQfVerses(res.verses || []))
    totalPages = Number(res.pagination?.total_pages) || 1
    page += 1
  } while (page <= totalPages && page <= 5)

  return all.sort((a, b) => a.num - b.num)
}

/**
 * Refresh from API without blocking UI; update memory + IndexedDB when done.
 * @param {number} id
 */
function refreshChapterInBackground(id) {
  if (refreshing.has(id)) return
  refreshing.add(id)
  fetchChapterFromApi(id)
    .then((rows) => {
      if (rows.length) rememberChapter(id, rows)
    })
    .catch(() => {
      /* keep stale cache */
    })
    .finally(() => {
      refreshing.delete(id)
    })
}

/**
 * Load chapter verses: memory → IndexedDB (API mirror) → live API.
 * Always revalidates from Quran.com API when online (background if cache hit).
 * @param {number} chapterId
 * @param {{ forceRefresh?: boolean }} [opts]
 */
export async function loadChapterVerses(chapterId, opts = {}) {
  const id = Number(chapterId)
  const forceRefresh = Boolean(opts.forceRefresh)

  if (!forceRefresh) {
    const mem = getCachedChapterVerses(id)
    if (mem?.length) {
      refreshChapterInBackground(id)
      return mem
    }

    const key = chapterCacheKey(id, DEFAULT_TRANSLATION_ID)
    const stored = await idbGetChapter(key)
    if (stored && isChapterEntryFresh(stored) && stored.verses?.length) {
      chapterCache.set(id, stored.verses)
      refreshChapterInBackground(id)
      return stored.verses
    }
  }

  const pending = inflight.get(id)
  if (pending) return pending

  const promise = (async () => {
    // Prefer stale IDB over spinner if network fails
    const key = chapterCacheKey(id, DEFAULT_TRANSLATION_ID)
    try {
      const rows = await fetchChapterFromApi(id)
      if (rows.length) {
        rememberChapter(id, rows)
        return rows
      }
    } catch (err) {
      const stored = await idbGetChapter(key)
      if (stored?.verses?.length) {
        chapterCache.set(id, stored.verses)
        return stored.verses
      }
      throw err
    }

    const stored = await idbGetChapter(key)
    if (stored?.verses?.length) {
      chapterCache.set(id, stored.verses)
      return stored.verses
    }
    return []
  })().finally(() => {
    inflight.delete(id)
  })

  inflight.set(id, promise)
  return promise
}

/**
 * Warm the next ayah's MP3 into Cache API.
 * @param {number} surahId
 * @param {number} ayahNumber
 * @param {(s: number, a: number) => string} [_urlFn]
 */
export function prefetchAyahAudio(surahId, ayahNumber, _urlFn) {
  prefetchAudio(surahId, ayahNumber)
}

/**
 * Hydrate memory from IndexedDB for a chapter (non-blocking helper).
 * @param {number} chapterId
 */
export async function hydrateChapterFromIdb(chapterId) {
  const id = Number(chapterId)
  if (getCachedChapterVerses(id)?.length) return getCachedChapterVerses(id)
  const stored = await idbGetChapter(chapterCacheKey(id, DEFAULT_TRANSLATION_ID))
  if (stored?.verses?.length && isChapterEntryFresh(stored)) {
    chapterCache.set(id, stored.verses)
    return stored.verses
  }
  return null
}
