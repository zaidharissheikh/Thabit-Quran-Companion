import { describe, expect, it, vi } from 'vitest';
import { AppError, handleError } from '../api/_lib/errors.js';

function mockRes() {
  return {
    headersSent: false,
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(payload) {
      this.body = payload;
    },
  };
}

describe('AppError', () => {
  it('marks operational errors by default', () => {
    const err = new AppError(400, 'BAD', 'nope');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD');
    expect(err.isOperational).toBe(true);
  });
});

describe('handleError', () => {
  it('returns consistent JSON for operational errors', () => {
    const res = mockRes();
    handleError(res, new AppError(401, 'UNAUTHENTICATED', 'Authentication required'));
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required',
      },
    });
  });

  it('hides unexpected error details in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockRes();
    handleError(res, new Error('secret stack detail'));
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
    expect(JSON.parse(res.body).error.message).not.toContain('secret');
    spy.mockRestore();
    process.env.NODE_ENV = prev;
  });

  it('does not write again if headers were already sent', () => {
    const res = mockRes();
    res.headersSent = true;
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    handleError(res, new AppError(400, 'X', 'y'));
    expect(res.body).toBeNull();
    spy.mockRestore();
  });
});
