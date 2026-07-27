import { describe, expect, it } from 'vitest';
import loginHandler from '../../api/_lib/auth/login.js';
import logoutHandler from '../../api/_lib/auth/logout.js';
import meHandler from '../../api/_lib/auth/me.js';
import refreshHandler from '../../api/_lib/auth/refresh.js';
import registerHandler from '../../api/_lib/auth/register.js';
import {
  ALLOWED_ORIGIN,
  FORBIDDEN_ORIGIN,
  cookieFlags,
  findSetCookie,
  invoke,
  parseCookieValues,
} from '../helpers/http.js';
import { TEST_DOB, TEST_PASSWORD, registerUser, uniqueEmail } from '../helpers/session.js';

describe('integration: auth', () => {
  it('register succeeds and sets HttpOnly / SameSite=Strict / Secure cookies', async () => {
    expect(process.env.COOKIE_SECURE).toBe('true');

    const email = uniqueEmail('reg');
    const res = await invoke(registerHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: {
        email,
        password: TEST_PASSWORD,
        name: 'Amina',
        dateOfBirth: TEST_DOB,
      },
    });

    expect(res.status).toBe(201);
    expect(res.json.user.email).toBe(email);

    const access = findSetCookie(res.setCookies, 'thabit_access');
    const refresh = findSetCookie(res.setCookies, 'thabit_refresh');
    expect(access).toBeTruthy();
    expect(refresh).toBeTruthy();

    const accessFlags = cookieFlags(access);
    const refreshFlags = cookieFlags(refresh);
    expect(accessFlags.httpOnly).toBe(true);
    expect(accessFlags.sameSiteStrict).toBe(true);
    expect(accessFlags.secure).toBe(true);
    expect(refreshFlags.httpOnly).toBe(true);
    expect(refreshFlags.sameSiteStrict).toBe(true);
    expect(refreshFlags.secure).toBe(true);
  });

  it('register rejects duplicate email with 409', async () => {
    const email = uniqueEmail('dup');
    const first = await invoke(registerHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: {
        email,
        password: TEST_PASSWORD,
        name: 'One',
        dateOfBirth: TEST_DOB,
      },
    });
    expect(first.status).toBe(201);

    const second = await invoke(registerHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: {
        email,
        password: TEST_PASSWORD,
        name: 'Two',
        dateOfBirth: TEST_DOB,
      },
    });
    expect(second.status).toBe(409);
    expect(second.json.error.code).toBe('EMAIL_TAKEN');
  });

  it('register rejects invalid email, weak password, and underage DOB with 400', async () => {
    const badEmail = await invoke(registerHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: {
        email: 'not-an-email',
        password: TEST_PASSWORD,
        name: 'Test',
        dateOfBirth: TEST_DOB,
      },
    });
    expect(badEmail.status).toBe(400);
    expect(badEmail.json.error.code).toBe('VALIDATION_ERROR');

    const weakPassword = await invoke(registerHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: {
        email: uniqueEmail('weak'),
        password: 'password123',
        name: 'Test',
        dateOfBirth: TEST_DOB,
      },
    });
    expect(weakPassword.status).toBe(400);
    expect(weakPassword.json.error.code).toBe('VALIDATION_ERROR');

    const underage = await invoke(registerHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: {
        email: uniqueEmail('young'),
        password: TEST_PASSWORD,
        name: 'Young User',
        dateOfBirth: '2020-01-01',
      },
    });
    expect(underage.status).toBe(400);
    expect(underage.json.error.code).toBe('VALIDATION_ERROR');
  });

  it('login rejects invalid email and empty password with 400', async () => {
    const badEmail = await invoke(loginHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: { email: 'not-an-email', password: TEST_PASSWORD },
    });
    expect(badEmail.status).toBe(400);
    expect(badEmail.json.error.code).toBe('VALIDATION_ERROR');

    const emptyPassword = await invoke(loginHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: { email: uniqueEmail('empty'), password: '' },
    });
    expect(emptyPassword.status).toBe(400);
    expect(emptyPassword.json.error.code).toBe('VALIDATION_ERROR');
  });

  it('login succeeds with correct credentials', async () => {
    const { email, password } = await registerUser();
    const res = await invoke(loginHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: { email, password },
    });
    expect(res.status).toBe(200);
    expect(res.json.user.email).toBe(email);
    expect(findSetCookie(res.setCookies, 'thabit_access')).toBeTruthy();
  });

  it('login fails with wrong password and nonexistent email using the same error shape', async () => {
    const { email } = await registerUser();

    const wrongPassword = await invoke(loginHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: { email, password: 'Definitely-Wrong1!' },
    });
    const missingUser = await invoke(loginHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: { email: uniqueEmail('missing'), password: TEST_PASSWORD },
    });

    expect(wrongPassword.status).toBe(401);
    expect(missingUser.status).toBe(401);
    expect(wrongPassword.json.error).toEqual(missingUser.json.error);
    expect(wrongPassword.json.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('/api/auth/me returns user with valid cookie and 401 without/invalid', async () => {
    const session = await registerUser();

    const ok = await invoke(meHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
    });
    expect(ok.status).toBe(200);
    expect(ok.json.user.email).toBe(session.email);

    const missing = await invoke(meHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
    });
    expect(missing.status).toBe(401);

    const invalid = await invoke(meHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: { thabit_access: 'not.a.jwt' },
    });
    expect(invalid.status).toBe(401);
  });

  it('rejects disallowed Origin on mutating auth routes even with valid cookies', async () => {
    const session = await registerUser();

    const routes = [
      {
        handler: registerHandler,
        body: {
          email: uniqueEmail('origin'),
          password: TEST_PASSWORD,
          name: 'Origin',
          dateOfBirth: TEST_DOB,
        },
      },
      {
        handler: loginHandler,
        body: { email: session.email, password: session.password },
      },
      { handler: refreshHandler, body: {} },
      { handler: logoutHandler, body: {} },
    ];

    for (const route of routes) {
      const res = await invoke(route.handler, {
        method: 'POST',
        headers: { origin: FORBIDDEN_ORIGIN },
        cookies: session.cookies,
        body: route.body,
      });
      expect(res.status, `expected origin reject`).toBe(403);
      expect(res.json.error.code).toBe('ORIGIN_FORBIDDEN');
    }
  });

  it('refresh rotates tokens and invalidates the old refresh token', async () => {
    const session = await registerUser();
    const oldRefresh = session.cookies.thabit_refresh;
    expect(oldRefresh).toBeTruthy();

    const first = await invoke(refreshHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: {
        thabit_access: session.cookies.thabit_access,
        thabit_refresh: oldRefresh,
      },
    });
    expect(first.status).toBe(200);
    const rotated = parseCookieValues(first.setCookies);
    expect(rotated.thabit_refresh).toBeTruthy();
    expect(rotated.thabit_refresh).not.toBe(oldRefresh);

    const secondWithOld = await invoke(refreshHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: { thabit_refresh: oldRefresh },
    });
    expect(secondWithOld.status).toBe(401);
    expect(secondWithOld.json.error.code).toBe('UNAUTHENTICATED');
  });

  it('logout clears cookies and invalidates refresh', async () => {
    const session = await registerUser();

    const logout = await invoke(logoutHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
    });
    expect(logout.status).toBe(200);

    const accessClear = findSetCookie(logout.setCookies, 'thabit_access');
    const refreshClear = findSetCookie(logout.setCookies, 'thabit_refresh');
    expect(accessClear).toMatch(/Max-Age=0/i);
    expect(refreshClear).toMatch(/Max-Age=0/i);

    const refreshAfter = await invoke(refreshHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: { thabit_refresh: session.cookies.thabit_refresh },
    });
    expect(refreshAfter.status).toBe(401);
  });

  it('rate limits login after AUTH_RATE_LIMIT_PER_WINDOW', async () => {
    const limit = Number(process.env.AUTH_RATE_LIMIT_PER_WINDOW);
    expect(limit).toBeGreaterThan(0);

    const email = uniqueEmail('rate');
    await invoke(registerHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      body: {
        email,
        password: TEST_PASSWORD,
        name: 'Rate',
        dateOfBirth: TEST_DOB,
      },
    });

    const ip = '203.0.113.50';
    let last;
    for (let i = 0; i < limit; i += 1) {
      last = await invoke(loginHandler, {
        method: 'POST',
        headers: {
          origin: ALLOWED_ORIGIN,
          'x-forwarded-for': ip,
        },
        body: { email, password: TEST_PASSWORD },
      });
      expect(last.status).toBe(200);
    }

    const blocked = await invoke(loginHandler, {
      method: 'POST',
      headers: {
        origin: ALLOWED_ORIGIN,
        'x-forwarded-for': ip,
      },
      body: { email, password: TEST_PASSWORD },
    });
    expect(blocked.status).toBe(429);
    expect(blocked.json.error.code).toBe('RATE_LIMITED');
  });
});
