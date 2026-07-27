import { AppError } from './errors.js';

/**
 * @returns {string[]}
 */
export function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || 'http://localhost:5173';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {string | undefined} value
 * @returns {string | null}
 */
export function extractOrigin(value) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Resolve request origin from Origin or Referer.
 * @param {import('http').IncomingMessage} req
 * @returns {string | null}
 */
export function getRequestOrigin(req) {
  const originHeader = req.headers.origin;
  if (typeof originHeader === 'string' && originHeader.length > 0) {
    return extractOrigin(originHeader) || originHeader;
  }
  const referer = req.headers.referer || req.headers.referrer;
  if (typeof referer === 'string') {
    return extractOrigin(referer);
  }
  return null;
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {boolean}
 */
export function isOriginAllowed(req) {
  const allowed = getAllowedOrigins();
  const origin = getRequestOrigin(req);
  if (!origin) return false;
  return allowed.includes(origin);
}

/**
 * Apply baseline security headers on every response.
 * @param {import('http').ServerResponse} res
 */
export function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  );
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
}

/**
 * CORS for browser clients. Returns true if the response was ended (preflight).
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean}
 */
export function applyCors(req, res) {
  const allowed = getAllowedOrigins();
  const requestOrigin =
    typeof req.headers.origin === 'string' ? req.headers.origin : null;

  if (requestOrigin && allowed.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}

/**
 * Defense-in-depth for credentialed/authenticated requests.
 * @param {import('http').IncomingMessage} req
 */
export function assertAllowedOrigin(req) {
  if (!isOriginAllowed(req)) {
    throw new AppError(
      403,
      'ORIGIN_FORBIDDEN',
      'Request origin is not allowed',
    );
  }
}

/**
 * JSON success helper.
 * @param {import('http').ServerResponse} res
 * @param {number} status
 * @param {unknown} data
 */
export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}
