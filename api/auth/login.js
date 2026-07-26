import {
  requireOrigin,
  createRefreshToken,
  setAuthCookies,
  signAccessToken,
} from '../_lib/auth.js';
import { getCollection } from '../_lib/db.js';
import { AppError } from '../_lib/errors.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import { assertPassword } from '../_lib/password.js';
import { rateLimitAuthIp } from '../_lib/rateLimit.js';
import { loginSchema } from '../_lib/schemas/auth.js';
import { parseOrThrow, readJsonBody } from '../_lib/validate.js';

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
