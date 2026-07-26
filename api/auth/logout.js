import {
  requireOrigin,
  clearAuthCookies,
  getRefreshTokenFromRequest,
  hashToken,
  verifyAccessToken,
} from '../_lib/auth.js';
import { getCollection } from '../_lib/db.js';
import { AppError } from '../_lib/errors.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import { ObjectId } from 'mongodb';

async function clearRefreshByHash(tokenHash) {
  const users = await getCollection('users');
  await users.updateOne(
    { refreshTokenHash: tokenHash },
    {
      $set: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
        updatedAt: new Date(),
      },
    },
  );
}

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    requireOrigin(req);

    try {
      const auth = await verifyAccessToken(req);
      const users = await getCollection('users');
      await users.updateOne(
        { _id: new ObjectId(auth.userId) },
        {
          $set: {
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
            updatedAt: new Date(),
          },
        },
      );
    } catch (err) {
      // Expired/missing access token is expected on logout; still revoke refresh.
      if (!(err instanceof AppError) || err.code !== 'UNAUTHENTICATED') {
        throw err;
      }
      const raw = getRefreshTokenFromRequest(req);
      if (raw) {
        await clearRefreshByHash(hashToken(raw));
      }
    }

    clearAuthCookies(res);
    sendJson(res, 200, { ok: true });
  },
});
