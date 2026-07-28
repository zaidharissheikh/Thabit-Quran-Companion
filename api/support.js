import contactHandler from './_lib/support/contact.js';

export default async function supportRouter(req, res) {
  const path = req.url.split('?')[0];

  if (path.match(/\/support\/contact\/?$/) || path.match(/\/support\/?$/)) {
    return contactHandler(req, res);
  }

  res.status(404).json({ error: 'Not Found' });
}
