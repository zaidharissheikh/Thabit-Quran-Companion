import {
  requireOrigin,
  createRefreshToken,
  getRefreshTokenFromRequest,
  hashToken,
  setAuthCookies,
  signAccessToken,
  clearAuthCookies,
} from '../auth.js';
import { getCollection } from '../db.js';
import { AppError } from '../errors.js';
import { createHandler, sendJson } from '../handler.js';
import { rateLimitAuthIp } from '../rateLimit.js';

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
