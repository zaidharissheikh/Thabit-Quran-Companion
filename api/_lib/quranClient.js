import { AppError, log } from './errors.js';

const ENV_CONFIG = {
  prelive: {
    authBase: 'https://prelive-oauth2.quran.foundation',
    apiBase: 'https://apis-prelive.quran.foundation',
  },
  production: {
    authBase: 'https://oauth2.quran.foundation',
    apiBase: 'https://apis.quran.foundation',
  },
};

/**
 * Resolve QF environment + credentials.
 * Production credentials only when VERCEL_ENV=production (or QF_ENV=production).
 * Dev / preview always use the prelive credential set.
 */
export function getQfConfig() {
  const useProduction =
    process.env.QF_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production';

  const env = useProduction ? 'production' : 'prelive';
  const urls = ENV_CONFIG[env];

  const clientId = useProduction
    ? process.env.QF_PROD_CLIENT_ID || process.env.QF_CLIENT_ID_PROD
    : process.env.QF_PRELIVE_CLIENT_ID || process.env.QF_CLIENT_ID_PRELIVE;

  const clientSecret = useProduction
    ? process.env.QF_PROD_CLIENT_SECRET || process.env.QF_CLIENT_SECRET_PROD
    : process.env.QF_PRELIVE_CLIENT_SECRET || process.env.QF_CLIENT_SECRET_PRELIVE;

  if (!clientId || !clientSecret) {
    throw new AppError(
      503,
      'QF_NOT_CONFIGURED',
      `Quran Foundation ${env} credentials are not configured`,
    );
  }

  return {
    env,
    clientId,
    clientSecret,
    authBase: urls.authBase,
    apiBase: urls.apiBase,
  };
}

/**
 * Cached OAuth token on globalThis (same pattern as Mongo connection).
 * Re-requests ~30s before expiry. Single-flight via promise.
 * @returns {Promise<string>}
 */
export async function getQfAccessToken() {
  const config = getQfConfig();
  const g = globalThis;
  const now = Date.now();
  const skewMs = 30_000;

  if (
    g._qfTokenCache &&
    g._qfTokenCache.env === config.env &&
    g._qfTokenCache.token &&
    g._qfTokenCache.expiresAt - skewMs > now
  ) {
    return g._qfTokenCache.token;
  }

  if (g._qfTokenPromise && g._qfTokenPromiseEnv === config.env) {
    return g._qfTokenPromise;
  }

  g._qfTokenPromiseEnv = config.env;
  // Call through object so tests can spy without fighting ESM live bindings.
  g._qfTokenPromise = qfTokenFetcher.fetch(config)
    .then((result) => {
      g._qfTokenCache = {
        env: config.env,
        token: result.accessToken,
        expiresAt: Date.now() + result.expiresIn * 1000,
      };
      g._qfTokenPromise = undefined;
      g._qfTokenPromiseEnv = undefined;
      return result.accessToken;
    })
    .catch((err) => {
      g._qfTokenPromise = undefined;
      g._qfTokenPromiseEnv = undefined;
      throw err;
    });

  return g._qfTokenPromise;
}

/**
 * Clear cached token (e.g. after upstream 401).
 */
export function clearQfTokenCache() {
  const g = globalThis;
  g._qfTokenCache = undefined;
  g._qfTokenPromise = undefined;
  g._qfTokenPromiseEnv = undefined;
}

/**
 * OAuth client-credentials token request (exported for tests to spy/mock).
 * @param {ReturnType<typeof getQfConfig>} config
 */
export async function fetchQfToken(config) {
  const basic = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString('base64');

  let response;
  try {
    response = await fetch(`${config.authBase}/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=content',
    });
  } catch (err) {
    log('error', 'QF token request network failure', {
      message: err instanceof Error ? err.message : String(err),
      env: config.env,
    });
    throw new AppError(502, 'QF_TOKEN_FAILED', 'Failed to reach Quran API auth');
  }

  if (!response.ok) {
    log('error', 'QF token request rejected', {
      status: response.status,
      env: config.env,
    });
    throw new AppError(502, 'QF_TOKEN_FAILED', 'Failed to authenticate with Quran API');
  }

  const data = await response.json();
  if (!data.access_token || !data.expires_in) {
    throw new AppError(502, 'QF_TOKEN_FAILED', 'Invalid token response from Quran API');
  }

  return {
    accessToken: data.access_token,
    expiresIn: Number(data.expires_in) || 3600,
  };
}

/** Indirection for tests: `vi.spyOn(qfTokenFetcher, 'fetch')`. */
export const qfTokenFetcher = {
  fetch: fetchQfToken,
};

/**
 * Call Quran Foundation Content API with cached OAuth token.
 * On 401: clear token, re-request once, retry once.
 *
 * @param {string} path - e.g. `/content/api/v4/chapters`
 * @param {Record<string, string | number | undefined>} [query]
 */
export async function quranFetch(path, query = {}) {
  const config = getQfConfig();
  const url = new URL(path, config.apiBase);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const doRequest = async (token) =>
    fetch(url, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
        'x-client-id': config.clientId,
        Accept: 'application/json',
      },
    });

  let token = await getQfAccessToken();
  let response = await doRequest(token);

  if (response.status === 401) {
    clearQfTokenCache();
    token = await getQfAccessToken();
    response = await doRequest(token);
  }

  if (!response.ok) {
    log('warn', 'QF content request failed', {
      status: response.status,
      path,
      env: config.env,
    });
    throw new AppError(
      response.status === 429 ? 429 : 502,
      'QF_UPSTREAM_ERROR',
      'Quran content temporarily unavailable',
    );
  }

  return response.json();
}
