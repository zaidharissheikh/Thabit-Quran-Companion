import { getCollection } from './db.js';
import { AppError } from './errors.js';

/**
 * Atomic fixed-window rate limit via findOneAndUpdate + aggregation pipeline.
 * Uses $inc / conditional reset - never read-then-write.
 *
 * @param {string} key
 * @param {number} limit
 * @param {number} windowMs
 */
export async function consumeRateLimit(key, limit, windowMs) {
  const col = await getCollection('rate_limits');
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  const doc = await col.findOneAndUpdate(
    { key },
    [
      {
        $set: {
          key,
          count: {
            $cond: [
              {
                $or: [
                  { $eq: [{ $type: '$expiresAt' }, 'missing'] },
                  { $lte: ['$expiresAt', now] },
                ],
              },
              1,
              { $add: [{ $ifNull: ['$count', 0] }, 1] },
            ],
          },
          windowStart: {
            $cond: [
              {
                $or: [
                  { $eq: [{ $type: '$expiresAt' }, 'missing'] },
                  { $lte: ['$expiresAt', now] },
                ],
              },
              now,
              '$windowStart',
            ],
          },
          expiresAt: {
            $cond: [
              {
                $or: [
                  { $eq: [{ $type: '$expiresAt' }, 'missing'] },
                  { $lte: ['$expiresAt', now] },
                ],
              },
              windowEnd,
              '$expiresAt',
            ],
          },
        },
      },
    ],
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  const count = doc?.count ?? 0;
  if (count > limit) {
    throw new AppError(
      429,
      'RATE_LIMITED',
      'Too many requests. Please try again later.',
    );
  }

  return { count, remaining: Math.max(0, limit - count) };
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (typeof req.socket?.remoteAddress === 'string') {
    return req.socket.remoteAddress;
  }
  return 'unknown';
}

export async function rateLimitAuthIp(req) {
  const limit = Number(process.env.AUTH_RATE_LIMIT_PER_WINDOW || 10);
  const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const ip = getClientIp(req);
  return consumeRateLimit(`auth:${ip}`, limit, windowMs);
}

export async function rateLimitQuranIp(req) {
  const limit = Number(process.env.QURAN_RATE_LIMIT_PER_WINDOW || 60);
  const windowMs = Number(process.env.QURAN_RATE_LIMIT_WINDOW_MS || 60 * 1000);
  const ip = getClientIp(req);
  return consumeRateLimit(`quran:${ip}`, limit, windowMs);
}

export async function rateLimitAiUser(userId) {
  const limit = Number(process.env.AI_RATE_LIMIT_PER_HOUR || 20);
  const windowMs = 60 * 60 * 1000;
  return consumeRateLimit(`ai:${userId}`, limit, windowMs);
}
