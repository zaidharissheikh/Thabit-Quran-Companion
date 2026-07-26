import { ObjectId } from 'mongodb';
import { requireAuth } from '../_lib/auth.js';
import { getCollection } from '../_lib/db.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import {
  createNoteSchema,
  listNotesQuerySchema,
} from '../_lib/schemas/notes.js';
import { parseOrThrow, readJsonBody } from '../_lib/validate.js';

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
  methods: ['GET', 'POST'],
  async handler(req, res) {
    const auth = await requireAuth(req);
    const userId = new ObjectId(auth.userId);
    const col = await getCollection('notes');

    if (req.method === 'GET') {
      const query = parseOrThrow(listNotesQuerySchema, req.query || {});
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
        notes: items.map(serialize),
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      });
      return;
    }

    const body = parseOrThrow(createNoteSchema, await readJsonBody(req));
    const now = new Date();
    const result = await col.insertOne({
      userId,
      text: body.text,
      verseRef: body.verseRef,
      verseLabel: body.verseLabel,
      createdAt: now,
      updatedAt: now,
    });

    sendJson(res, 201, {
      note: serialize({
        _id: result.insertedId,
        ...body,
        createdAt: now,
        updatedAt: now,
      }),
    });
  },
});
