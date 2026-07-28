/**
 * Single client for all /api/* calls (credentials + refresh-once on 401).
 */

export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   * @param {unknown} [details]
   */
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isValidation() {
    return this.status === 400;
  }

  get isRateLimited() {
    return this.status === 429;
  }

  get isServer() {
    return this.status >= 500;
  }
}

/** @type {Promise<Response> | null} */
let refreshInFlight = null;

function isAuthPath(path) {
  return (
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/register') ||
    path.startsWith('/api/auth/refresh') ||
    path.startsWith('/api/auth/logout')
  );
}

/**
 * @param {string} path
 * @param {RequestInit & { json?: unknown }} [options]
 * @param {{ retry?: boolean }} [internal]
 */
export async function apiRequest(path, options = {}, internal = { retry: true }) {
  const { json, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders || {});

  let body = rest.body;
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(json);
  }

  const response = await fetch(path, {
    ...rest,
    body,
    headers,
    credentials: 'include',
  });

  if (
    response.status === 401 &&
    internal.retry !== false &&
    !isAuthPath(path)
  ) {
    try {
      if (!refreshInFlight) {
        refreshInFlight = fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        }).finally(() => {
          refreshInFlight = null;
        });
      }
      const refreshRes = await refreshInFlight;
      if (refreshRes.ok) {
        return apiRequest(path, options, { retry: false });
      }
    } catch {
      // fall through to 401 handling
    }
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const err = data?.error || {};
    throw new ApiError(
      response.status,
      err.code || 'REQUEST_FAILED',
      err.message || response.statusText || 'Request failed',
      err.details,
    );
  }

  return data;
}

export const authApi = {
  me: () => apiRequest('/api/auth/me'),
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      json: { email, password },
    }),
  register: (name, email, password, dateOfBirth) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      json: { name, email, password, dateOfBirth },
    }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  refresh: () => apiRequest('/api/auth/refresh', { method: 'POST' }),
  forgotPassword: (email) =>
    apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      json: { email },
    }),
  resetPassword: (token, password) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      json: { token, password },
    }),
};

export const progressApi = {
  get: () => apiRequest('/api/progress'),
  put: (progress) =>
    apiRequest('/api/progress', { method: 'PUT', json: progress }),
  patch: (progress) =>
    apiRequest('/api/progress', { method: 'PATCH', json: progress }),
};

export const bookmarksApi = {
  list: (page = 1, limit = 100) =>
    apiRequest(`/api/bookmarks?page=${page}&limit=${limit}`),
  create: (body) =>
    apiRequest('/api/bookmarks', { method: 'POST', json: body }),
  remove: (id) =>
    apiRequest(`/api/bookmarks/${id}`, { method: 'DELETE' }),
};

export const notesApi = {
  list: (page = 1, limit = 50) =>
    apiRequest(`/api/notes?page=${page}&limit=${limit}`),
  create: (body) =>
    apiRequest('/api/notes', { method: 'POST', json: body }),
};

export const aiApi = {
  reflect: ({ prompt, context, maxTokens }) =>
    apiRequest('/api/ai/reflect', {
      method: 'POST',
      json: { prompt, context, maxTokens },
    }),
};

export const supportApi = {
  contact: (body) =>
    apiRequest('/api/support/contact', {
      method: 'POST',
      json: body,
    }),
};

export const quranApi = {
  chapters: () => apiRequest('/api/quran/chapters'),
  chapter: (id) => apiRequest(`/api/quran/chapters/${id}`),
  verses: (id, { page = 1, per_page = 50 } = {}) =>
    apiRequest(
      `/api/quran/chapters/${id}/verses?page=${page}&per_page=${per_page}`,
    ),
};
