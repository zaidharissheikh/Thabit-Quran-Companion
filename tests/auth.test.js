import { beforeEach, describe, expect, it } from 'vitest';
import {
  createRefreshToken,
  hashToken,
  signAccessToken,
  verifyAccessToken,
} from '../api/_lib/auth.js';
import { buildAiCacheKey } from '../api/_lib/aiClient.js';
import { AppError } from '../api/_lib/errors.js';
import { assertAllowedOrigin } from '../api/_lib/cors.js';
import { hashPassword, verifyPassword } from '../api/_lib/password.js';
import { ObjectId } from 'mongodb';

beforeEach(() => {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-chars!!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!';
  process.env.CORS_ORIGINS = 'http://localhost:5173,https://thabit.vercel.app';
  process.env.COOKIE_SECURE = 'false';
});

describe('password hashing', () => {
  it('hashes with argon2id and verifies', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, 'correct horse battery')).toBe(true);
    expect(await verifyPassword(hash, 'wrong')).toBe(false);
  });
});

describe('JWT access tokens', () => {
  it('signs and verifies access tokens', async () => {
    const userId = new ObjectId().toString();
    const token = await signAccessToken(userId, 'user@example.com');
    const req = {
      headers: {
        cookie: `thabit_access=${token}`,
        origin: 'http://localhost:5173',
      },
    };
    const auth = await verifyAccessToken(req);
    expect(auth.userId).toBe(userId);
    expect(auth.email).toBe('user@example.com');
  });

  it('rejects missing access cookie', async () => {
    await expect(verifyAccessToken({ headers: {} })).rejects.toBeInstanceOf(AppError);
  });
});

describe('refresh token hashing', () => {
  it('creates unique tokens and stable hashes', () => {
    const a = createRefreshToken();
    const b = createRefreshToken();
    expect(a.token).not.toBe(b.token);
    expect(hashToken(a.token)).toBe(hashToken(a.token));
    expect(hashToken(a.token)).not.toBe(hashToken(b.token));
    expect(a.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('AI cache key', () => {
  it('changes when personalized context differs for the same prompt', () => {
    const prompt = 'Write a gentle reflection question';
    const a = buildAiCacheKey(
      prompt,
      { name: 'Amina', streak: 3 },
      180,
      'gemini-3.1-flash-lite',
      'user-a',
    );
    const b = buildAiCacheKey(
      prompt,
      { name: 'Yusuf', streak: 3 },
      180,
      'gemini-3.1-flash-lite',
      'user-b',
    );
    expect(a).not.toBe(b);
  });

  it('includes context fields, not prompt alone', () => {
    const sameUser = 'user-1';
    const base = buildAiCacheKey(
      'same prompt',
      { name: 'A', streak: 1, versesReadToday: 2, heartRating: 4 },
      180,
      'm',
      sameUser,
    );
    const differentStreak = buildAiCacheKey(
      'same prompt',
      { name: 'A', streak: 99, versesReadToday: 2, heartRating: 4 },
      180,
      'm',
      sameUser,
    );
    expect(base).not.toBe(differentStreak);
  });
});

describe('origin allowlist', () => {
  it('allows configured Origin', () => {
    expect(() =>
      assertAllowedOrigin({
        headers: { origin: 'https://thabit.vercel.app' },
      }),
    ).not.toThrow();
  });

  it('allows configured Referer when Origin is absent', () => {
    expect(() =>
      assertAllowedOrigin({
        headers: { referer: 'http://localhost:5173/settings' },
      }),
    ).not.toThrow();
  });

  it('rejects unknown origins', () => {
    expect(() =>
      assertAllowedOrigin({
        headers: { origin: 'https://evil.example' },
      }),
    ).toThrow(AppError);
  });
});
