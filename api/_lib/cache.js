import { getCollection } from './db.js';

/**
 * Shared Mongo-backed cache with TTL (expiresAt).
 * @param {string} key
 * @returns {Promise<unknown | null>}
 */
export async function cacheGet(key) {
  const col = await getCollection('cache_entries');
  const doc = await col.findOne({ key, expiresAt: { $gt: new Date() } });
  return doc ? doc.payload : null;
}

/**
 * @param {string} key
 * @param {'quran' | 'ai'} type
 * @param {unknown} payload
 * @param {number} ttlSeconds
 */
export async function cacheSet(key, type, payload, ttlSeconds) {
  const col = await getCollection('cache_entries');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
  await col.updateOne(
    { key },
    {
      $set: {
        key,
        type,
        payload,
        expiresAt,
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

export function quranCacheTtl(kind) {
  if (kind === 'chapters') {
    return Number(process.env.QURAN_CACHE_TTL_CHAPTERS || 24 * 60 * 60);
  }
  return Number(process.env.QURAN_CACHE_TTL_VERSES || 12 * 60 * 60);
}

export function aiCacheTtl() {
  return Number(process.env.AI_CACHE_TTL_SECONDS || 0);
}
