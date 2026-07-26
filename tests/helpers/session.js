import registerHandler from '../../api/auth/register.js';
import {
  ALLOWED_ORIGIN,
  invoke,
  parseCookieValues,
} from './http.js';

let userSeq = 0;

export function uniqueEmail(prefix = 'user') {
  userSeq += 1;
  return `${prefix}-${userSeq}-${Date.now()}@example.com`;
}

/**
 * Register a user and return auth cookies + user payload.
 */
/** Matches frontend + API strong-password policy */
export const TEST_PASSWORD = 'Password1!';

/** Adult DOB for age-gate tests (YYYY-MM-DD) */
export const TEST_DOB = '2000-01-15';

export async function registerUser(overrides = {}) {
  const email = overrides.email || uniqueEmail();
  const password = overrides.password || TEST_PASSWORD;
  const name = overrides.name || 'Test User';
  const dateOfBirth = overrides.dateOfBirth || TEST_DOB;

  const res = await invoke(registerHandler, {
    method: 'POST',
    headers: { origin: ALLOWED_ORIGIN },
    body: { email, password, name, dateOfBirth },
  });

  if (res.status !== 201) {
    throw new Error(
      `registerUser failed: ${res.status} ${JSON.stringify(res.json)}`,
    );
  }

  const cookies = parseCookieValues(res.setCookies);
  return {
    email,
    password,
    name,
    user: res.json.user,
    cookies,
    setCookies: res.setCookies,
    response: res,
  };
}
