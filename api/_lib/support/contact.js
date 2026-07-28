import { ObjectId } from 'mongodb';
import { Resend } from 'resend';
import { requireAuth, requireOrigin } from '../auth.js';
import { getCollection } from '../db.js';
import { requireEmailConfig } from '../emailConfig.js';
import { AppError } from '../errors.js';
import { createHandler, sendJson } from '../handler.js';
import { consumeRateLimit, getClientIp } from '../rateLimit.js';
import { supportContactSchema } from '../schemas/support.js';
import { parseOrThrow, readJsonBody } from '../validate.js';

const TOPIC_LABELS = {
  suggestion: 'Feature suggestion',
  bug: 'Bug report',
  question: 'Question',
  other: 'Other',
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    requireOrigin(req);
    const auth = await requireAuth(req);

    const ip = getClientIp(req);
    await consumeRateLimit(`support:${auth.userId}`, 2, 24 * 60 * 60 * 1000);
    await consumeRateLimit(`support-ip:${ip}`, 10, 60 * 60 * 1000);

    const { apiKey, fromAddress, toEmail } = requireEmailConfig();

    const body = parseOrThrow(supportContactSchema, await readJsonBody(req));
    const users = await getCollection('users');
    const user = await users.findOne(
      { _id: new ObjectId(auth.userId) },
      { projection: { name: 1, email: 1 } },
    );

    const fromName = user?.name || 'Thabit user';
    const fromEmail = user?.email;
    if (!fromEmail) {
      throw new AppError(400, 'EMAIL_REQUIRED', 'Your account has no email on file.');
    }

    const topicLabel = TOPIC_LABELS[body.topic] || body.topic;
    const resend = new Resend(apiKey);

    try {
      await resend.emails.send({
        from: fromAddress,
        to: toEmail,
        replyTo: fromEmail,
        subject: `[Thabit Support] ${topicLabel}: ${body.subject}`,
        html: `
          <h2>New Help &amp; Support message</h2>
          <p><strong>From:</strong> ${escapeHtml(fromName)} &lt;${escapeHtml(fromEmail)}&gt;</p>
          <p><strong>Topic:</strong> ${escapeHtml(topicLabel)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(body.subject)}</p>
          <hr />
          <p style="white-space:pre-wrap">${escapeHtml(body.message)}</p>
        `,
      });
    } catch (err) {
      console.error('Failed to send support email with Resend:', err);
      throw new AppError(
        502,
        'EMAIL_SEND_FAILED',
        'Could not send your message. Please try again shortly.',
      );
    }

    // Optional audit trail (does not replace email)
    try {
      const col = await getCollection('support_messages');
      await col.insertOne({
        userId: new ObjectId(auth.userId),
        email: fromEmail,
        name: fromName,
        topic: body.topic,
        subject: body.subject,
        message: body.message,
        createdAt: new Date(),
      });
    } catch {
      /* non-fatal */
    }

    sendJson(res, 200, {
      message: 'Thanks. Your message was sent to the Thabit team.',
    });
  },
});
