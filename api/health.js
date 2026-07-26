import {
  getGeminiUpstreamCount,
  resetGeminiUpstreamCount,
} from './_lib/aiClient.js';
import { createHandler, sendJson } from './_lib/handler.js';

export default createHandler({
  methods: ['GET'],
  async handler(req, res) {
    const qfConfigured = Boolean(
      (process.env.VERCEL_ENV === 'production' || process.env.QF_ENV === 'production'
        ? process.env.QF_PROD_CLIENT_ID || process.env.QF_CLIENT_ID_PROD
        : process.env.QF_PRELIVE_CLIENT_ID || process.env.QF_CLIENT_ID_PRELIVE) &&
        (process.env.VERCEL_ENV === 'production' || process.env.QF_ENV === 'production'
          ? process.env.QF_PROD_CLIENT_SECRET || process.env.QF_CLIENT_SECRET_PROD
          : process.env.QF_PRELIVE_CLIENT_SECRET || process.env.QF_CLIENT_SECRET_PRELIVE),
    );

    const isProd =
      process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

    if (!isProd && req.query?.resetGeminiCount === '1') {
      resetGeminiUpstreamCount();
    }

    sendJson(res, 200, {
      ok: true,
      mongoConfigured: Boolean(process.env.MONGODB_URI),
      aiConfigured: Boolean(process.env.AI_API_KEY || process.env.GEMINI_API_KEY),
      qfConfigured,
      qfEnv:
        process.env.QF_ENV === 'production' || process.env.VERCEL_ENV === 'production'
          ? 'production'
          : 'prelive',
      ...(!isProd
        ? { geminiUpstreamCalls: getGeminiUpstreamCount() }
        : {}),
    });
  },
});
