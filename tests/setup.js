import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeEach } from 'vitest';
import { clearQfTokenCache } from '../api/_lib/quranClient.js';

const STATE_PATH = path.join(process.cwd(), 'tests', '.mongo-test-state.json');

function applyTestEnv() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-chars!!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!';
  process.env.COOKIE_SECURE = 'true';
  process.env.CORS_ORIGINS = 'http://localhost:5173,https://thabit.vercel.app';
  process.env.AUTH_RATE_LIMIT_PER_WINDOW = '5';
  process.env.AUTH_RATE_LIMIT_WINDOW_MS = '900000';
  process.env.QURAN_RATE_LIMIT_PER_WINDOW = '5';
  process.env.QURAN_RATE_LIMIT_WINDOW_MS = '60000';
  process.env.AI_RATE_LIMIT_PER_HOUR = '3';
  process.env.AI_CACHE_TTL_SECONDS = '60';
  process.env.AI_API_KEY = 'test-ai-key';
  process.env.AI_MODEL = 'gemini-3.1-flash-lite';
  process.env.QF_PRELIVE_CLIENT_ID = 'test-qf-client-id';
  process.env.QF_PRELIVE_CLIENT_SECRET = 'test-qf-client-secret';
  process.env.QF_ENV = 'prelive';
  process.env.QURAN_CACHE_TTL_CHAPTERS = '3600';
  process.env.QURAN_CACHE_TTL_VERSES = '3600';
  process.env.VERCEL_ENV = 'test';

  if (!fs.existsSync(STATE_PATH)) {
    throw new Error(
      'Missing tests/.mongo-test-state.json - globalSetup did not start MongoMemoryServer',
    );
  }

  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  process.env.MONGODB_URI = state.uri;
  process.env.MONGODB_DB = state.dbName || 'thabit_test';
  globalThis._mongoClientPromise = undefined;
  clearQfTokenCache();
}

applyTestEnv();

beforeEach(async () => {
  applyTestEnv();
  clearQfTokenCache();

  const { getDb } = await import('../api/_lib/db.js');
  const db = await getDb();
  const collections = await db.collections();
  await Promise.all(collections.map((col) => col.deleteMany({})));
});

afterAll(async () => {
  if (globalThis._mongoClientPromise) {
    const client = await globalThis._mongoClientPromise;
    await client.close();
    globalThis._mongoClientPromise = undefined;
  }
  clearQfTokenCache();
});
