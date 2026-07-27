import indexHandler from './_lib/notes/index.js';
import idHandler from './_lib/notes/[id].js';

export default async function notesRouter(req, res) {
  const path = req.url.split('?')[0];

  if (path.match(/\/notes\/?$/)) {
    return indexHandler(req, res);
  }

  const match = path.match(/\/notes\/([^\/]+)\/?$/);
  if (match) {
    req.query = req.query || {};
    req.query.id = match[1];
    return idHandler(req, res);
  }

  res.status(404).json({ error: 'Not Found' });
}
