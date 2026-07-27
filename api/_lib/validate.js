import { ZodError } from 'zod';
import { AppError } from './errors.js';

/**
 * Parse and validate with Zod; throw AppError 400 on failure.
 * @template {import('zod').ZodTypeAny} T
 * @param {T} schema
 * @param {unknown} data
 * @returns {import('zod').infer<T>}
 */
export function parseOrThrow(schema, data) {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request', {
        details: err.flatten(),
      });
    }
    throw err;
  }
}

/**
 * Read and parse JSON body from a Node IncomingMessage.
 * Supports pre-parsed `req.body` (tests / some runtimes) without weakening
 * stream-based parsing for real Vercel invocations.
 * @param {import('http').IncomingMessage & { body?: unknown }} req
 * @param {number} [maxBytes]
 * @returns {Promise<unknown>}
 */
export async function readJsonBody(req, maxBytes = 64_000) {
  // Tests / some runtimes set an own `body` property (plain object or string).
  if (Object.prototype.hasOwnProperty.call(req, 'body')) {
    const pre = req.body;
    if (pre === undefined || pre === null) return {};
    if (typeof pre === 'string') {
      const raw = pre.trim();
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        throw new AppError(400, 'INVALID_JSON', 'Request body must be valid JSON');
      }
    }
    if (typeof pre === 'object' && !Buffer.isBuffer(pre)) {
      return pre;
    }
  }

  // Vercel Node exposes a prototype getter for `body` that can throw - try once.
  try {
    const protoBody = req.body;
    if (protoBody !== undefined && protoBody !== null) {
      if (typeof protoBody === 'string') {
        const raw = protoBody.trim();
        if (!raw) return {};
        return JSON.parse(raw);
      }
      if (typeof protoBody === 'object' && !Buffer.isBuffer(protoBody)) {
        return protoBody;
      }
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    // Fall through to raw stream read when the platform getter fails.
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      throw new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body too large');
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }
}
