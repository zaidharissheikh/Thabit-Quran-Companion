import { ObjectId } from 'mongodb';
import { requireAuth } from '../_lib/auth.js';
import { getCollection } from '../_lib/db.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import {
  defaultProgress,
  progressUpdateSchema,
} from '../_lib/schemas/progress.js';
import { parseOrThrow, readJsonBody } from '../_lib/validate.js';

function serializeProgress(doc, name) {
  return {
    name: doc.name || name || 'Friend',
    goal: doc.goal,
    streak: doc.streak,
    versesReadToday: doc.versesReadToday,
    lastReadDate: doc.lastReadDate,
    heartRating: doc.heartRating,
    ramadanVerses: doc.ramadanVerses,
    sessions: doc.sessions || [],
    dailyNudge: doc.dailyNudge || { date: null, text: '' },
    dailyReflection: doc.dailyReflection || { date: null, text: '' },
    moodHistory: doc.moodHistory || {},
    readLogs: doc.readLogs || {},
    preferences: doc.preferences || {},
    updatedAt: doc.updatedAt || null,
  };
}

async function ensureProgress(progress, userId, name) {
  let doc = await progress.findOne({ userId });
  if (doc) return doc;

  const defaults = defaultProgress(name);
  const now = new Date();
  try {
    await progress.insertOne({
      userId,
      ...defaults,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  doc = await progress.findOne({ userId });
  return doc || { userId, ...defaults, updatedAt: now };
}

export default createHandler({
  methods: ['GET', 'PUT', 'PATCH'],
  async handler(req, res) {
    const auth = await requireAuth(req);
    const userId = new ObjectId(auth.userId);
    const progress = await getCollection('progress');
    const users = await getCollection('users');
    const user = await users.findOne(
      { _id: userId },
      { projection: { name: 1 } },
    );
    const name = user?.name || 'Friend';

    if (req.method === 'GET') {
      const doc = await ensureProgress(progress, userId, name);
      sendJson(res, 200, { progress: serializeProgress(doc, name) });
      return;
    }

    const body = parseOrThrow(progressUpdateSchema, await readJsonBody(req));
    const existing = await ensureProgress(progress, userId, name);

    const now = new Date();
    const { preferences: prefsPatch, ...rest } = body;
    const $set = {
      ...rest,
      name,
      updatedAt: now,
    };
    if (prefsPatch) {
      $set.preferences = {
        ...(existing.preferences || {}),
        ...prefsPatch,
      };
    }

    const doc = await progress.findOneAndUpdate(
      { userId },
      { $set },
      { returnDocument: 'after' },
    );

    sendJson(res, 200, { progress: serializeProgress(doc, name) });
  },
});
