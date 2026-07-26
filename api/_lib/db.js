import { MongoClient } from 'mongodb';
import { AppError, log } from './errors.js';

const uri = process.env.MONGODB_URI;

/**
 * Cached MongoClient promise on globalThis so warm serverless
 * invocations reuse the pool instead of opening new connections.
 * @returns {Promise<import('mongodb').MongoClient>}
 */
export async function getMongoClient() {
  if (!uri) {
    throw new AppError(
      500,
      'CONFIG_ERROR',
      'MONGODB_URI is not configured',
      { isOperational: false },
    );
  }

  const g = globalThis;

  if (!g._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    g._mongoClientPromise = client.connect().catch((err) => {
      g._mongoClientPromise = undefined;
      log('error', 'MongoDB connection failed', {
        message: err instanceof Error ? err.message : String(err),
      });
      throw new AppError(503, 'DB_UNAVAILABLE', 'Database unavailable', {
        isOperational: true,
      });
    });
  }

  return g._mongoClientPromise;
}

/**
 * @param {string} [dbName]
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb(dbName = process.env.MONGODB_DB || 'thabit') {
  const client = await getMongoClient();
  return client.db(dbName);
}

/**
 * @param {string} name
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
