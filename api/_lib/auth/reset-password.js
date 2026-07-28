import { createHash } from 'node:crypto';
import { requireOrigin } from '../auth.js';
import { getCollection } from '../db.js';
import { AppError } from '../errors.js';
import { createHandler, sendJson } from '../handler.js';
import { hashPassword } from '../password.js';
import { rateLimitAuthIp } from '../rateLimit.js';
import { resetPasswordSchema } from '../schemas/auth.js';
import { parseOrThrow, readJsonBody } from '../validate.js';

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    requireOrigin(req);
    await rateLimitAuthIp(req);

    const body = parseOrThrow(resetPasswordSchema, await readJsonBody(req));
    const tokenHash = createHash('sha256').update(body.token).digest('hex');
    
    const users = await getCollection('users');
    const user = await users.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError(400, 'INVALID_TOKEN', 'The reset token is invalid or has expired.');
    }

    const newPasswordHash = await hashPassword(body.password);

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
        $unset: {
          resetTokenHash: "",
          resetTokenExpiresAt: "",
          refreshTokenHash: "", // optionally clear all sessions so they have to log in again
          refreshTokenExpiresAt: "",
        },
      }
    );

    sendJson(res, 200, {
      message: 'Password has been reset successfully.',
    });
  },
});
