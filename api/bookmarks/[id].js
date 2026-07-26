import { ObjectId } from 'mongodb';
import { requireAuth } from '../_lib/auth.js';
import { getCollection } from '../_lib/db.js';
import { AppError } from '../_lib/errors.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import { updateBookmarkSchema } from '../_lib/schemas/bookmarks.js';
import { parseOrThrow, readJsonBody } from '../_lib/validate.js';

function parseId(raw) {
  if (typeof raw !== 'string' || !ObjectId.isValid(raw)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid bookmark id');
  }
  return new ObjectId(raw);
}

function serialize(doc) {
  return {
    id: doc._id.toString(),
    surahId: doc.surahId,
    ayahNumber: doc.ayahNumber,
    ref: doc.ref,
    arabic: doc.arabic || '',
    translation: doc.translation || '',
    surahName: doc.surahName || '',
    createdAt: doc.createdAt,
  };
}

export default createHandler({
  methods: ['GET', 'PATCH', 'DELETE'],
  async handler(req, res) {
    const auth = await requireAuth(req);
    const userId = new ObjectId(auth.userId);
    const id = parseId(req.query?.id);
    const col = await getCollection('bookmarks');
    const filter = { _id: id, userId };

    if (req.method === 'GET') {
      const doc = await col.findOne(filter);
      if (!doc) throw new AppError(404, 'NOT_FOUND', 'Bookmark not found');
      sendJson(res, 200, { bookmark: serialize(doc) });
      return;
    }

    if (req.method === 'DELETE') {
      const result = await col.deleteOne(filter);
      if (result.deletedCount === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Bookmark not found');
      }
      sendJson(res, 200, { ok: true });
      return;
    }

    const body = parseOrThrow(updateBookmarkSchema, await readJsonBody(req));
    if (Object.keys(body).length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'No fields to update');
    }

    const $set = { ...body };
    if (body.surahId !== undefined || body.ayahNumber !== undefined) {
      const existing = await col.findOne(filter);
      if (!existing) throw new AppError(404, 'NOT_FOUND', 'Bookmark not found');
      const surahId = body.surahId ?? existing.surahId;
      const ayahNumber = body.ayahNumber ?? existing.ayahNumber;
      $set.ref = body.ref || `${surahId}:${ayahNumber}`;
    }

    try {
      const doc = await col.findOneAndUpdate(
        filter,
        { $set },
        { returnDocument: 'after' },
      );
      if (!doc) throw new AppError(404, 'NOT_FOUND', 'Bookmark not found');
      sendJson(res, 200, { bookmark: serialize(doc) });
    } catch (err) {
      if (err?.code === 11000) {
        throw new AppError(409, 'BOOKMARK_EXISTS', 'Bookmark already saved');
      }
      throw err;
    }
  },
});
