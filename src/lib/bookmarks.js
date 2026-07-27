/**
 * Derive stable surahId + ayahNumber for API bookmarks.
 */

const REF_PAIR = /(\d+)\s*:\s*(\d+)/;

/**
 * @param {string | undefined | null} ref
 * @returns {{ surahId: number, ayahNumber: number } | null}
 */
export function parseRefIds(ref) {
  if (!ref || typeof ref !== 'string') return null;
  const match = ref.match(REF_PAIR);
  if (!match) return null;
  return {
    surahId: Number(match[1]),
    ayahNumber: Number(match[2]),
  };
}

/**
 * Today-verse bookmark payload from VERSES entry.
 * @param {{ ar: string, en: string, ref: string, surah: string }} verse
 */
export function payloadFromTodayVerse(verse) {
  const ids = parseRefIds(verse.ref);
  if (!ids) {
    throw new Error(`Cannot derive surah/ayah from ref: ${verse.ref}`);
  }
  return {
    surahId: ids.surahId,
    ayahNumber: ids.ayahNumber,
    ref: verse.ref,
    arabic: verse.ar || '',
    translation: verse.en || '',
    surahName: verse.surah || '',
  };
}

/**
 * Surah-page verse bookmark payload.
 * @param {{ num: number, ar: string, en: string }} verse
 * @param {{ num: number, name: string }} surah
 */
export function payloadFromSurahVerse(verse, surah) {
  const surahId = Number(surah.num);
  const ayahNumber = Number(verse.num);
  return {
    surahId,
    ayahNumber,
    ref: `${surahId}:${ayahNumber}`,
    arabic: verse.ar || '',
    translation: verse.en || '',
    surahName: surah.name || '',
  };
}

/**
 * Normalize API bookmark for UI (compat fields for existing screens).
 * @param {object} b
 */
export function normalizeBookmark(b) {
  return {
    id: b.id,
    surahId: b.surahId,
    ayahNumber: b.ayahNumber,
    ref: b.ref,
    arabic: b.arabic || '',
    translation: b.translation || '',
    surahName: b.surahName || '',
    ar: b.arabic || '',
    en: b.translation || '',
    surah: b.surahName || '',
    num: b.ayahNumber,
  };
}

/**
 * @param {Array} bookmarks
 * @param {{ surahId: number, ayahNumber: number }} ids
 */
export function findBookmark(bookmarks, ids) {
  return bookmarks.find(
    (b) => b.surahId === ids.surahId && b.ayahNumber === ids.ayahNumber,
  );
}
