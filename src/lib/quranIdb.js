/**
 * IndexedDB mirror of Quran.com API chapter verse payloads.
 * Not a custom Quran DB - only stores last successful API responses.
 */

const DB_NAME = 'thabit-quran-cache'
const DB_VERSION = 1
const STORE = 'chapter_verses'

/** Client TTL: still refresh from API in background; this only gates stale purge. */
export const VERSE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null

function openDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable'))
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onerror = () => reject(req.error || new Error('IndexedDB open failed'))
      req.onsuccess = () => resolve(req.result)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'key' })
        }
      }
    })
  }
  return dbPromise
}

/**
 * @param {number} chapterId
 * @param {number} [translationId]
 */
export function chapterCacheKey(chapterId, translationId = 20) {
  return `ch:${Number(chapterId)}:t${Number(translationId) || 20}`
}

/**
 * @param {string} key
 * @returns {Promise<{
 *   key: string,
 *   chapterId: number,
 *   translationId: number,
 *   verses: { num: number, ar: string, en: string, key?: string }[],
 *   fetchedAt: number,
 * } | null>}
 */
export async function idbGetChapter(key) {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

/**
 * @param {{
 *   key: string,
 *   chapterId: number,
 *   translationId: number,
 *   verses: { num: number, ar: string, en: string, key?: string }[],
 *   fetchedAt?: number,
 * }} entry
 */
export async function idbPutChapter(entry) {
  try {
    const db = await openDb()
    const row = {
      ...entry,
      fetchedAt: entry.fetchedAt || Date.now(),
      source: 'quran-api',
    }
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const req = tx.objectStore(STORE).put(row)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * @param {string} key
 */
export function isChapterEntryFresh(entry, ttlMs = VERSE_CACHE_TTL_MS) {
  if (!entry?.fetchedAt || !Array.isArray(entry.verses) || !entry.verses.length) {
    return false
  }
  return Date.now() - entry.fetchedAt < ttlMs
}
