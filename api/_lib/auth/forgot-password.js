import { randomBytes, createHash } from 'node:crypto';
import { Resend } from 'resend';
import { requireOrigin } from '../auth.js';
import { getCollection } from '../db.js';
import { createHandler, sendJson } from '../handler.js';
import { rateLimitAuthIp } from '../rateLimit.js';
import { forgotPasswordSchema } from '../schemas/auth.js';
import { parseOrThrow, readJsonBody } from '../validate.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    requireOrigin(req);
    await rateLimitAuthIp(req);

    const body = parseOrThrow(forgotPasswordSchema, await readJsonBody(req));
    const users = await getCollection('users');
    const user = await users.findOne({ email: body.email });

    if (user) {
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            resetTokenHash,
            resetTokenExpiresAt,
            updatedAt: new Date(),
          },
        }
      );

      const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
      const frontendUrl = isProd ? 'https://thabitquran.com' : 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

      try {
        await resend.emails.send({
          from: 'Thaabit <onboarding@thabitquran.com>',
          to: user.email,
          subject: 'Reset your password for Thaabit',
          html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`
        });
      } catch (err) {
        console.error('Failed to send email with Resend:', err);
      }
    }

    sendJson(res, 200, {
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  },
});
