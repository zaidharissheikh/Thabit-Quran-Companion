/**
 * Cache API storage for ayah MP3s (copies of CDN responses).
 * Without a service worker, audio elements use blob URLs resolved from this cache.
 */

import { ayahAudioUrl } from './quranAudio'

const CACHE_NAME = 'thabit-ayah-audio-v1'
const MAX_CACHED_AYAH = 60

/** @type {Map<string, string>} network URL → object URL */
const objectUrls = new Map()

async function openAudioCache() {
  if (typeof caches === 'undefined') return null
  try {
    return await caches.open(CACHE_NAME)
  } catch {
    return null
  }
}

/**
 * Evict oldest entries when over the cap.
 * @param {Cache} cache
 */
async function trimCache(cache) {
  try {
    const keys = await cache.keys()
    if (keys.length <= MAX_CACHED_AYAH) return
    const overflow = keys.length - MAX_CACHED_AYAH
    for (let i = 0; i < overflow; i += 1) {
      await cache.delete(keys[i])
    }
  } catch {
    /* ignore */
  }
}

/**
 * Prefetch and store an ayah MP3 from the CDN.
 * @param {number} surahId
 * @param {number} ayahNumber
 */
export async function cacheAyahAudio(surahId, ayahNumber) {
  if (ayahNumber < 1) return
  const url = ayahAudioUrl(surahId, ayahNumber)
  const cache = await openAudioCache()
  if (!cache) return

  try {
    const existing = await cache.match(url)
    if (existing) return
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
    if (!res.ok) return
    await cache.put(url, res.clone())
    await trimCache(cache)
  } catch {
    /* CORS / offline - ignore */
  }
}

/**
 * Resolve a playable URL: cached blob if present, else CDN URL (and warm cache).
 * @param {number} surahId
 * @param {number} ayahNumber
 * @returns {Promise<string>}
 */
export async function resolveAyahAudioUrl(surahId, ayahNumber) {
  const url = ayahAudioUrl(surahId, ayahNumber)
  const cache = await openAudioCache()

  if (cache) {
    try {
      const match = await cache.match(url)
      if (match) {
        const blob = await match.blob()
        const prev = objectUrls.get(url)
        if (prev) URL.revokeObjectURL(prev)
        const objectUrl = URL.createObjectURL(blob)
        objectUrls.set(url, objectUrl)
        return objectUrl
      }
    } catch {
      /* fall through to network */
    }
    // Warm cache in background; play from CDN now
    cacheAyahAudio(surahId, ayahNumber)
  }

  return url
}

/**
 * @param {number} surahId
 * @param {number} ayahNumber
 * @param {(s: number, a: number) => string} [_urlFn] unused - kept for call-site compat
 */
export function prefetchAyahAudio(surahId, ayahNumber, _urlFn) {
  void cacheAyahAudio(surahId, ayahNumber)
}
