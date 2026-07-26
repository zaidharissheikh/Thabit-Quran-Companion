import { createRequest, createResponse } from 'node-mocks-http';
import { EventEmitter } from 'node:events';

export const ALLOWED_ORIGIN = 'http://localhost:5173';
export const FORBIDDEN_ORIGIN = 'https://evil.example';

/**
 * Invoke a Vercel-style default export handler in-process.
 * @param {(req: unknown, res: unknown) => Promise<void>} handler
 * @param {{
 *   method?: string,
 *   body?: unknown,
 *   query?: Record<string, string>,
 *   headers?: Record<string, string>,
 *   cookies?: Record<string, string>,
 * }} options
 */
export async function invoke(handler, options = {}) {
  const {
    method = 'GET',
    body,
    query = {},
    headers = {},
    cookies = {},
  } = options;

  const cookieHeader =
    headers.cookie ||
    Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

  const req = createRequest({
    method,
    url: '/',
    query,
    headers: {
      ...headers,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body,
  });

  const res = createResponse({ eventEmitter: EventEmitter });

  await handler(req, res);

  let json = null;
  const raw = res._getData();
  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      json = raw;
    }
  }

  const setCookie = res.getHeader('Set-Cookie');
  const setCookies = !setCookie
    ? []
    : Array.isArray(setCookie)
      ? setCookie.map(String)
      : [String(setCookie)];

  return {
    status: res.statusCode,
    json,
    headers: res._getHeaders(),
    setCookies,
  };
}

/**
 * @param {string[]} setCookies
 * @returns {Record<string, string>}
 */
export function parseCookieValues(setCookies) {
  const out = {};
  for (const line of setCookies) {
    const [pair] = line.split(';');
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (value) out[name] = value;
  }
  return out;
}

/**
 * @param {string[]} setCookies
 * @param {string} name
 */
export function findSetCookie(setCookies, name) {
  return setCookies.find((c) => c.startsWith(`${name}=`)) || null;
}

/**
 * @param {string} cookieLine
 */
export function cookieFlags(cookieLine) {
  const lower = cookieLine.toLowerCase();
  return {
    httpOnly: lower.includes('httponly'),
    secure: lower.includes('secure'),
    sameSiteStrict: /samesite=strict/i.test(cookieLine),
  };
}
