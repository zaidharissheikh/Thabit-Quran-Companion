import { createHash, randomBytes } from 'node:crypto';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import * as jose from 'jose';
import { ObjectId } from 'mongodb';
import { assertAllowedOrigin } from './cors.js';
import { getCollection } from './db.js';
import { AppError } from './errors.js';

const ACCESS_COOKIE = 'thabit_access';
const REFRESH_COOKIE = 'thabit_refresh';

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) {
    throw new AppError(
      500,
      'CONFIG_ERROR',
      'JWT_ACCESS_SECRET must be set (min 32 chars)',
      { isOperational: false },
    );
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret.length < 32) {
    throw new AppError(
      500,
      'CONFIG_ERROR',
      'JWT_REFRESH_SECRET must be set (min 32 chars)',
      { isOperational: false },
    );
  }
  return secret;
}

function cookieSecure() {
  if (process.env.COOKIE_SECURE === 'false') return false;
  if (process.env.COOKIE_SECURE === 'true') return true;
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

function accessTtlSeconds() {
  return Number(process.env.JWT_ACCESS_TTL_SECONDS || 15 * 60);
}

function refreshTtlSeconds() {
  return Number(process.env.JWT_REFRESH_TTL_SECONDS || 7 * 24 * 60 * 60);
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Record<string, string>}
 */
export function readCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return parseCookie(header);
}

/**
 * @param {string} userId
 * @param {string} email
 */
export async function signAccessToken(userId, email) {
  const ttl = accessTtlSeconds();
  return new jose.SignJWT({ email, typ: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(getAccessSecret());
}

/**
 * Create opaque refresh token + hash for DB storage.
 */
export function createRefreshToken() {
  const token = randomBytes(48).toString('base64url');
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + refreshTtlSeconds() * 1000);
  return { token, hash, expiresAt };
}

/**
 * @param {string} token
 */
export function hashToken(token) {
  return createHash('sha256')
    .update(`${getRefreshSecret()}:${token}`)
    .digest('hex');
}

/**
 * @param {import('http').ServerResponse} res
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export function setAuthCookies(res, accessToken, refreshToken) {
  const secure = cookieSecure();
  const accessMaxAge = accessTtlSeconds();
  const refreshMaxAge = refreshTtlSeconds();

  const access = serializeCookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: accessMaxAge,
  });

  const refresh = serializeCookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: refreshMaxAge,
  });

  const prev = res.getHeader('Set-Cookie');
  if (!prev) {
    res.setHeader('Set-Cookie', [access, refresh]);
  } else if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, access, refresh]);
  } else {
    res.setHeader('Set-Cookie', [String(prev), access, refresh]);
  }
}

/**
 * @param {import('http').ServerResponse} res
 */
export function clearAuthCookies(res) {
  const secure = cookieSecure();
  const access = serializeCookie(ACCESS_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  const refresh = serializeCookie(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', [access, refresh]);
}

/**
 * Verify access JWT. Does not check Origin (call assertAllowedOrigin separately).
 * @param {import('http').IncomingMessage} req
 */
export async function verifyAccessToken(req) {
  const cookies = readCookies(req);
  const token = cookies[ACCESS_COOKIE];
  if (!token) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
  }

  try {
    const { payload } = await jose.jwtVerify(token, getAccessSecret(), {
      algorithms: ['HS256'],
    });
    if (payload.typ !== 'access' || typeof payload.sub !== 'string') {
      throw new AppError(401, 'UNAUTHENTICATED', 'Invalid access token');
    }
    if (!ObjectId.isValid(payload.sub)) {
      throw new AppError(401, 'UNAUTHENTICATED', 'Invalid access token');
    }
    return {
      userId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : '',
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, 'UNAUTHENTICATED', 'Invalid or expired access token');
  }
}

/**
 * Auth middleware: Origin/Referer allowlist + JWT verification.
 * Always derives identity from the verified token — never from the body.
 * @param {import('http').IncomingMessage} req
 */
export async function requireAuth(req) {
  assertAllowedOrigin(req);
  return verifyAccessToken(req);
}

/**
 * For auth routes that set cookies (login/register/refresh) — still require Origin.
 * @param {import('http').IncomingMessage} req
 */
export function requireOrigin(req) {
  assertAllowedOrigin(req);
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {string | null}
 */
export function getRefreshTokenFromRequest(req) {
  const cookies = readCookies(req);
  return cookies[REFRESH_COOKIE] || null;
}

/**
 * Load user by id; 401 if missing.
 * @param {string} userId
 */
export async function findUserById(userId) {
  const users = await getCollection('users');
  const user = await users.findOne(
    { _id: new ObjectId(userId) },
    { projection: { passwordHash: 0, refreshTokenHash: 0 } },
  );
  if (!user) {
    throw new AppError(401, 'UNAUTHENTICATED', 'User not found');
  }
  return user;
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
