import { requireOrigin, createRefreshToken, setAuthCookies, signAccessToken } from '../_lib/auth.js';
import { getCollection } from '../_lib/db.js';
import { AppError } from '../_lib/errors.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import { hashPassword } from '../_lib/password.js';
import { rateLimitAuthIp } from '../_lib/rateLimit.js';
import { registerSchema } from '../_lib/schemas/auth.js';
import { defaultProgress } from '../_lib/schemas/progress.js';
import { parseOrThrow, readJsonBody } from '../_lib/validate.js';

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    requireOrigin(req);
    await rateLimitAuthIp(req);

    const body = parseOrThrow(registerSchema, await readJsonBody(req));
    const users = await getCollection('users');

    const existing = await users.findOne({ email: body.email });
    if (existing) {
      throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }

    const now = new Date();
    const passwordHash = await hashPassword(body.password);
    const refresh = createRefreshToken();

    const insert = await users.insertOne({
      email: body.email,
      passwordHash,
      name: body.name,
      dateOfBirth: body.dateOfBirth,
      refreshTokenHash: refresh.hash,
      refreshTokenExpiresAt: refresh.expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    const userId = insert.insertedId.toString();

    const progress = await getCollection('progress');
    await progress.insertOne({
      userId: insert.insertedId,
      ...defaultProgress(body.name),
      createdAt: now,
      updatedAt: now,
    });

    const accessToken = await signAccessToken(userId, body.email);
    setAuthCookies(res, accessToken, refresh.token);

    sendJson(res, 201, {
      user: {
        id: userId,
        email: body.email,
        name: body.name,
      },
    });
  },
});
