import { describe, expect, it } from 'vitest';
import bookmarkIdHandler from '../../api/bookmarks/[id].js';
import bookmarksHandler from '../../api/bookmarks/index.js';
import {
  ALLOWED_ORIGIN,
  invoke,
} from '../helpers/http.js';
import { registerUser } from '../helpers/session.js';

describe('integration: bookmarks', () => {
  it('supports full CRUD + pagination', async () => {
    const session = await registerUser();

    const created = await invoke(bookmarksHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: {
        surahId: 1,
        ayahNumber: 1,
        arabic: 'بِسْمِ',
        translation: 'In the name',
        surahName: 'Al-Fatihah',
      },
    });
    expect(created.status).toBe(201);
    expect(created.json.bookmark.ref).toBe('1:1');
    const id = created.json.bookmark.id;

    await invoke(bookmarksHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { surahId: 1, ayahNumber: 2 },
    });
    await invoke(bookmarksHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { surahId: 2, ayahNumber: 1 },
    });

    const list = await invoke(bookmarksHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { page: '1', limit: '2' },
    });
    expect(list.status).toBe(200);
    expect(list.json.bookmarks).toHaveLength(2);
    expect(list.json.total).toBe(3);
    expect(list.json.totalPages).toBe(2);

    const one = await invoke(bookmarkIdHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
    });
    expect(one.status).toBe(200);
    expect(one.json.bookmark.id).toBe(id);

    const updated = await invoke(bookmarkIdHandler, {
      method: 'PATCH',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
      body: { translation: 'Updated meaning' },
    });
    expect(updated.status).toBe(200);
    expect(updated.json.bookmark.translation).toBe('Updated meaning');

    const deleted = await invoke(bookmarkIdHandler, {
      method: 'DELETE',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
    });
    expect(deleted.status).toBe(200);

    const missing = await invoke(bookmarkIdHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
    });
    expect(missing.status).toBe(404);
  });

  it('scopes by owner — foreign IDs return 404 (not 403)', async () => {
    const userA = await registerUser({ name: 'A' });
    const userB = await registerUser({ name: 'B' });

    const created = await invoke(bookmarksHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      body: { surahId: 3, ayahNumber: 5 },
    });
    const id = created.json.bookmark.id;

    for (const method of ['GET', 'PATCH', 'DELETE']) {
      const res = await invoke(bookmarkIdHandler, {
        method,
        headers: { origin: ALLOWED_ORIGIN },
        cookies: userB.cookies,
        query: { id },
        body: method === 'PATCH' ? { translation: 'nope' } : undefined,
      });
      expect(res.status, method).toBe(404);
      expect(res.json.error.code).toBe('NOT_FOUND');
    }

    const stillThere = await invoke(bookmarkIdHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      query: { id },
    });
    expect(stillThere.status).toBe(200);
  });

  it('rejects malformed create input with 400', async () => {
    const session = await registerUser();
    const res = await invoke(bookmarksHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { surahId: 999, ayahNumber: 1 },
    });
    expect(res.status).toBe(400);
    expect(res.json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects duplicate bookmark for same user/surah/ayah with 409', async () => {
    const session = await registerUser();
    const body = { surahId: 1, ayahNumber: 7 };

    const first = await invoke(bookmarksHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body,
    });
    expect(first.status).toBe(201);

    const second = await invoke(bookmarksHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body,
    });
    expect(second.status).toBe(409);
    expect(second.json.error.code).toBe('BOOKMARK_EXISTS');
  });
});
