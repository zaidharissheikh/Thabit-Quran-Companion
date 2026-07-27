/**
 * Operational vs unexpected errors + consistent JSON error responses.
 */

export class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} code
   * @param {string} message
   * @param {{ details?: unknown, isOperational?: boolean }} [options]
   */
  constructor(statusCode, code, message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options.isOperational !== false;
    this.details = options.details;
  }
}

/**
 * Structured server-side log (no secrets / no client leak).
 * @param {'error' | 'warn' | 'info'} level
 * @param {string} message
 * @param {Record<string, unknown>} [meta]
 */
export function log(level, message, meta = {}) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

/**
 * @param {import('http').ServerResponse} res
 * @param {unknown} err
 */
export function handleError(res, err) {
  if (res.headersSent) {
    log('error', 'Response already sent when handling error', {
      name: err instanceof Error ? err.name : 'unknown',
    });
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    const body = {
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details !== undefined && process.env.NODE_ENV !== 'production') {
      body.error.details = err.details;
    }
    res.statusCode = err.statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
    return;
  }

  const name = err instanceof Error ? err.name : 'Error';
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  log('error', 'Unhandled error', { name, message, stack });

  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }),
  );
}
