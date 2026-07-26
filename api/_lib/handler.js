import { applyCors, applySecurityHeaders, sendJson } from './cors.js';
import { handleError, AppError } from './errors.js';

/**
 * Wrap a Vercel serverless handler with CORS, security headers, method checks,
 * and centralized error handling.
 *
 * @param {{
 *   methods: string[],
 *   handler: (req: import('http').IncomingMessage, res: import('http').ServerResponse) => Promise<void>,
 * }} options
 */
export function createHandler({ methods, handler }) {
  return async function vercelHandler(req, res) {
    applySecurityHeaders(res);

    try {
      if (applyCors(req, res)) {
        return;
      }

      const method = req.method || 'GET';
      if (!methods.includes(method)) {
        throw new AppError(405, 'METHOD_NOT_ALLOWED', `Method ${method} not allowed`);
      }

      await handler(req, res);
    } catch (err) {
      handleError(res, err);
    }
  };
}

export { sendJson };
