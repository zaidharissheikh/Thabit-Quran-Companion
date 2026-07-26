/**
 * Same index definitions as scripts/setup-indexes.mjs (kept in sync for tests).
 * @param {import('mongodb').Db} db
 */
export async function ensureIndexes(db) {
  await db.collection('users').createIndexes([
    { key: { email: 1 }, name: 'users_email_unique', unique: true },
    { key: { refreshTokenHash: 1 }, name: 'users_refresh_hash', sparse: true },
  ]);

  await db.collection('progress').createIndexes([
    { key: { userId: 1 }, name: 'progress_user_unique', unique: true },
  ]);

  await db.collection('bookmarks').createIndexes([
    { key: { userId: 1, createdAt: -1 }, name: 'bookmarks_user_created' },
    {
      key: { userId: 1, surahId: 1, ayahNumber: 1 },
      name: 'bookmarks_user_ayah_unique',
      unique: true,
    },
  ]);

  await db.collection('notes').createIndexes([
    { key: { userId: 1, createdAt: -1 }, name: 'notes_user_created' },
  ]);

  await db.collection('cache_entries').createIndexes([
    { key: { key: 1 }, name: 'cache_key_unique', unique: true },
    {
      key: { expiresAt: 1 },
      name: 'cache_ttl',
      expireAfterSeconds: 0,
    },
  ]);

  await db.collection('rate_limits').createIndexes([
    { key: { key: 1 }, name: 'rate_key_unique', unique: true },
    {
      key: { expiresAt: 1 },
      name: 'rate_ttl',
      expireAfterSeconds: 0,
    },
  ]);
}
