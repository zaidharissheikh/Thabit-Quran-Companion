import { ObjectId } from 'mongodb';
import { requireAuth } from '../auth.js';
import { getCollection } from '../db.js';
import { AppError } from '../errors.js';
import { createHandler, sendJson } from '../handler.js';
import { updateNoteSchema } from '../schemas/notes.js';
import { parseOrThrow, readJsonBody } from '../validate.js';

function parseId(raw) {
  if (typeof raw !== 'string' || !ObjectId.isValid(raw)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid note id');
  }
  return new ObjectId(raw);
}

function serialize(doc) {
  return {
    id: doc._id.toString(),
    text: doc.text,
    verseRef: doc.verseRef ?? null,
    verseLabel: doc.verseLabel ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export default createHandler({
  methods: ['GET', 'PATCH', 'DELETE'],
  async handler(req, res) {
    const auth = await requireAuth(req);
    const userId = new ObjectId(auth.userId);
    const id = parseId(req.query?.id);
    const col = await getCollection('notes');
    const filter = { _id: id, userId };

    if (req.method === 'GET') {
      const doc = await col.findOne(filter);
      if (!doc) throw new AppError(404, 'NOT_FOUND', 'Note not found');
      sendJson(res, 200, { note: serialize(doc) });
      return;
    }

    if (req.method === 'DELETE') {
      const result = await col.deleteOne(filter);
      if (result.deletedCount === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Note not found');
      }
      sendJson(res, 200, { ok: true });
      return;
    }

    const body = parseOrThrow(updateNoteSchema, await readJsonBody(req));
    if (Object.keys(body).length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'No fields to update');
    }

    const doc = await col.findOneAndUpdate(
      filter,
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new AppError(404, 'NOT_FOUND', 'Note not found');
    sendJson(res, 200, { note: serialize(doc) });
  },
});
