import { ObjectId } from 'mongodb';
import { requireAuth } from '../auth.js';
import { getCollection } from '../db.js';
import { AppError } from '../errors.js';
import { createHandler, sendJson } from '../handler.js';
import {
  createBookmarkSchema,
  listQuerySchema,
} from '../schemas/bookmarks.js';
import { parseOrThrow, readJsonBody } from '../validate.js';

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
  methods: ['GET', 'POST'],
  async handler(req, res) {
    const auth = await requireAuth(req);
    const userId = new ObjectId(auth.userId);
    const col = await getCollection('bookmarks');

    if (req.method === 'GET') {
      const query = parseOrThrow(listQuerySchema, req.query || {});
      const skip = (query.page - 1) * query.limit;
      const filter = { userId };

      const [items, total] = await Promise.all([
        col
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(query.limit)
          .toArray(),
        col.countDocuments(filter),
      ]);

      sendJson(res, 200, {
        bookmarks: items.map(serialize),
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      });
      return;
    }

    const body = parseOrThrow(createBookmarkSchema, await readJsonBody(req));
    const ref = body.ref || `${body.surahId}:${body.ayahNumber}`;
    const now = new Date();

    try {
      const result = await col.insertOne({
        userId,
        surahId: body.surahId,
        ayahNumber: body.ayahNumber,
        ref,
        arabic: body.arabic,
        translation: body.translation,
        surahName: body.surahName,
        createdAt: now,
      });

      sendJson(res, 201, {
        bookmark: serialize({
          _id: result.insertedId,
          ...body,
          ref,
          createdAt: now,
        }),
      });
    } catch (err) {
      if (err?.code === 11000) {
        throw new AppError(409, 'BOOKMARK_EXISTS', 'Bookmark already saved');
      }
      throw err;
    }
  },
});
