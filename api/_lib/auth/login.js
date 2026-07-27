import {
  requireOrigin,
  createRefreshToken,
  setAuthCookies,
  signAccessToken,
} from '../auth.js';
import { getCollection } from '../db.js';
import { AppError } from '../errors.js';
import { createHandler, sendJson } from '../handler.js';
import { assertPassword } from '../password.js';
import { rateLimitAuthIp } from '../rateLimit.js';
import { loginSchema } from '../schemas/auth.js';
import { parseOrThrow, readJsonBody } from '../validate.js';

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    requireOrigin(req);
    await rateLimitAuthIp(req);

    const body = parseOrThrow(loginSchema, await readJsonBody(req));
    const users = await getCollection('users');
    const user = await users.findOne({ email: body.email });

    if (!user?.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    await assertPassword(user.passwordHash, body.password);

    const refresh = createRefreshToken();
    const now = new Date();
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          refreshTokenHash: refresh.hash,
          refreshTokenExpiresAt: refresh.expiresAt,
          updatedAt: now,
        },
      },
    );

    const userId = user._id.toString();
    const accessToken = await signAccessToken(userId, user.email);
    setAuthCookies(res, accessToken, refresh.token);

    sendJson(res, 200, {
      user: {
        id: userId,
        email: user.email,
        name: user.name || 'Friend',
      },
    });
  },
});
