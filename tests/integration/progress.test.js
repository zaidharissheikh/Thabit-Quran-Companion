import { describe, expect, it } from 'vitest';
import progressHandler from '../../api/progress/index.js';
import {
  ALLOWED_ORIGIN,
  invoke,
} from '../helpers/http.js';
import { registerUser } from '../helpers/session.js';

describe('integration: progress', () => {
  it('first GET auto-seeds defaults without a prior PUT', async () => {
    const session = await registerUser({ name: 'Seeded' });

    // Register already inserts progress - delete it to simulate first read.
    const { getCollection } = await import('../../api/_lib/db.js');
    const progress = await getCollection('progress');
    await progress.deleteMany({});

    const res = await invoke(progressHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
    });

    expect(res.status).toBe(200);
    expect(res.json.progress).toMatchObject({
      name: 'Seeded',
      goal: 10,
      streak: 0,
      versesReadToday: 0,
      heartRating: 3,
      ramadanVerses: 0,
      sessions: [],
      dailyNudge: { date: null, text: '' },
      dailyReflection: { date: null, text: '' },
    });
    expect(res.json.progress.lastReadDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('PUT/PATCH updates persist on next GET', async () => {
    const session = await registerUser();

    const put = await invoke(progressHandler, {
      method: 'PUT',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { goal: 25, streak: 4, versesReadToday: 7 },
    });
    expect(put.status).toBe(200);
    expect(put.json.progress.goal).toBe(25);
    expect(put.json.progress.streak).toBe(4);

    const patch = await invoke(progressHandler, {
      method: 'PATCH',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { heartRating: 5 },
    });
    expect(patch.status).toBe(200);
    expect(patch.json.progress.heartRating).toBe(5);
    expect(patch.json.progress.goal).toBe(25);

    const get = await invoke(progressHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
    });
    expect(get.json.progress).toMatchObject({
      goal: 25,
      streak: 4,
      versesReadToday: 7,
      heartRating: 5,
    });
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await invoke(progressHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
    });
    expect(res.status).toBe(401);
    expect(res.json.error.code).toBe('UNAUTHENTICATED');
  });

  it('scopes progress to the JWT user (no cross-user read/write)', async () => {
    const userA = await registerUser({ name: 'UserA' });
    const userB = await registerUser({ name: 'UserB' });

    await invoke(progressHandler, {
      method: 'PUT',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      body: { goal: 11, streak: 9 },
    });
    await invoke(progressHandler, {
      method: 'PUT',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userB.cookies,
      body: { goal: 22, streak: 1 },
    });

    const aGet = await invoke(progressHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
    });
    const bGet = await invoke(progressHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userB.cookies,
    });

    expect(aGet.json.progress.goal).toBe(11);
    expect(aGet.json.progress.streak).toBe(9);
    expect(bGet.json.progress.goal).toBe(22);
    expect(bGet.json.progress.streak).toBe(1);

    // Body cannot retarget another user - userId is ignored/not in schema.
    const sneaky = await invoke(progressHandler, {
      method: 'PUT',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      body: { goal: 99, userId: userB.user.id },
    });
    expect(sneaky.status).toBe(200);
    expect(sneaky.json.progress.goal).toBe(99);

    const bAfter = await invoke(progressHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userB.cookies,
    });
    expect(bAfter.json.progress.goal).toBe(22);
  });
});
