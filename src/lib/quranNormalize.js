/**
 * Normalize Quran Foundation verse payloads into UI-friendly rows.
 * @param {unknown} verse
 * @returns {{ num: number, ar: string, en: string, key?: string } | null}
 */
export function normalizeQfVerse(verse) {
  if (!verse || typeof verse !== 'object') return null
  const v = /** @type {Record<string, any>} */ (verse)
  const num = Number(v.verse_number ?? v.verseNumber ?? v.num)
  if (!Number.isFinite(num) || num < 1) return null

  const ar =
    v.text_uthmani ||
    v.text_uthmani_simple ||
    v.text_imlaei ||
    v.text_indopak ||
    v.arabic ||
    ''

  let en = ''
  if (Array.isArray(v.translations) && v.translations.length > 0) {
    en = String(v.translations[0]?.text || '')
      .replace(/<[^>]+>/g, '')
      .trim()
  } else if (v.translation) {
    en = String(v.translation).replace(/<[^>]+>/g, '').trim()
  }

  return {
    num,
    ar: String(ar).trim(),
    en,
    key: v.verse_key || `${v.chapter_id || ''}:${num}`,
  }
}

/**
 * @param {unknown[]} verses
 */
export function normalizeQfVerses(verses) {
  if (!Array.isArray(verses)) return []
  return verses.map(normalizeQfVerse).filter(Boolean)
}
