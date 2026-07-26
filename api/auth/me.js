import { requireAuth, findUserById } from '../_lib/auth.js';
import { createHandler, sendJson } from '../_lib/handler.js';

export default createHandler({
  methods: ['GET'],
  async handler(req, res) {
    const auth = await requireAuth(req);
    const user = await findUserById(auth.userId);
    sendJson(res, 200, {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || 'Friend',
      },
    });
  },
});
