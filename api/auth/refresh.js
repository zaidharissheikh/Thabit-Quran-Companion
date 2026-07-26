import {
  requireOrigin,
  createRefreshToken,
  getRefreshTokenFromRequest,
  hashToken,
  setAuthCookies,
  signAccessToken,
  clearAuthCookies,
} from '../_lib/auth.js';
import { getCollection } from '../_lib/db.js';
import { AppError } from '../_lib/errors.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import { rateLimitAuthIp } from '../_lib/rateLimit.js';

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    requireOrigin(req);
    await rateLimitAuthIp(req);

    const raw = getRefreshTokenFromRequest(req);
    if (!raw) {
      clearAuthCookies(res);
      throw new AppError(401, 'UNAUTHENTICATED', 'Refresh token missing');
    }

    const tokenHash = hashToken(raw);
    const users = await getCollection('users');
    const user = await users.findOne({
      refreshTokenHash: tokenHash,
      refreshTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      clearAuthCookies(res);
      throw new AppError(401, 'UNAUTHENTICATED', 'Invalid or expired refresh token');
    }

    const refresh = createRefreshToken();
    const now = new Date();
    await users.updateOne(
      { _id: user._id, refreshTokenHash: tokenHash },
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
