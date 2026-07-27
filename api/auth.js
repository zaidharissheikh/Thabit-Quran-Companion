import loginHandler from './_lib/auth/login.js';
import registerHandler from './_lib/auth/register.js';
import logoutHandler from './_lib/auth/logout.js';
import meHandler from './_lib/auth/me.js';
import refreshHandler from './_lib/auth/refresh.js';

export default async function authRouter(req, res) {
  const path = req.url.split('?')[0];

  if (path.endsWith('/login')) return loginHandler(req, res);
  if (path.endsWith('/register')) return registerHandler(req, res);
  if (path.endsWith('/logout')) return logoutHandler(req, res);
  if (path.endsWith('/me')) return meHandler(req, res);
  if (path.endsWith('/refresh')) return refreshHandler(req, res);

  res.status(404).json({ error: 'Not Found' });
}
