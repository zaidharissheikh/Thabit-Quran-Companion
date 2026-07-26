import { requireAuth } from '../_lib/auth.js';
import { generateReflection } from '../_lib/aiClient.js';
import { createHandler, sendJson } from '../_lib/handler.js';
import { rateLimitAiUser } from '../_lib/rateLimit.js';
import { reflectSchema } from '../_lib/schemas/ai.js';
import { parseOrThrow, readJsonBody } from '../_lib/validate.js';

export default createHandler({
  methods: ['POST'],
  async handler(req, res) {
    const auth = await requireAuth(req);
    await rateLimitAiUser(auth.userId);

    const body = parseOrThrow(reflectSchema, await readJsonBody(req));
    const result = await generateReflection(
      body.prompt,
      body.context,
      body.maxTokens,
      { userId: auth.userId },
    );

    sendJson(res, 200, {
      text: result.text,
      source: result.source,
    });
  },
});
