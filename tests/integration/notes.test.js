import { describe, expect, it } from 'vitest';
import noteIdHandler from '../../api/_lib/notes/[id].js';
import notesHandler from '../../api/_lib/notes/index.js';
import {
  ALLOWED_ORIGIN,
  invoke,
} from '../helpers/http.js';
import { registerUser } from '../helpers/session.js';

describe('integration: notes', () => {
  it('supports full CRUD + pagination', async () => {
    const session = await registerUser();

    const created = await invoke(notesHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: {
        text: 'First reflection',
        verseRef: '1:1',
        verseLabel: 'Al-Fatihah 1',
      },
    });
    expect(created.status).toBe(201);
    const id = created.json.note.id;

    await invoke(notesHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { text: 'Second' },
    });
    await invoke(notesHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { text: 'Third' },
    });

    const list = await invoke(notesHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { page: '1', limit: '2' },
    });
    expect(list.status).toBe(200);
    expect(list.json.notes).toHaveLength(2);
    expect(list.json.total).toBe(3);

    const one = await invoke(noteIdHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
    });
    expect(one.status).toBe(200);
    expect(one.json.note.text).toBe('First reflection');

    const updated = await invoke(noteIdHandler, {
      method: 'PATCH',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
      body: { text: 'Updated reflection' },
    });
    expect(updated.status).toBe(200);
    expect(updated.json.note.text).toBe('Updated reflection');

    const deleted = await invoke(noteIdHandler, {
      method: 'DELETE',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
    });
    expect(deleted.status).toBe(200);

    const missing = await invoke(noteIdHandler, {
      method: 'GET',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      query: { id },
    });
    expect(missing.status).toBe(404);
  });

  it('scopes by owner - foreign IDs return 404 (not 403)', async () => {
    const userA = await registerUser({ name: 'User A' });
    const userB = await registerUser({ name: 'User B' });

    const created = await invoke(notesHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: userA.cookies,
      body: { text: 'Private note' },
    });
    const id = created.json.note.id;

    for (const method of ['GET', 'PATCH', 'DELETE']) {
      const res = await invoke(noteIdHandler, {
        method,
        headers: { origin: ALLOWED_ORIGIN },
        cookies: userB.cookies,
        query: { id },
        body: method === 'PATCH' ? { text: 'hijack' } : undefined,
      });
      expect(res.status, method).toBe(404);
      expect(res.json.error.code).toBe('NOT_FOUND');
    }
  });

  it('rejects malformed create input with 400', async () => {
    const session = await registerUser();
    const res = await invoke(notesHandler, {
      method: 'POST',
      headers: { origin: ALLOWED_ORIGIN },
      cookies: session.cookies,
      body: { text: '' },
    });
    expect(res.status).toBe(400);
    expect(res.json.error.code).toBe('VALIDATION_ERROR');
  });
});
