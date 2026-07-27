import indexHandler from './_lib/bookmarks/index.js';
import idHandler from './_lib/bookmarks/[id].js';

export default async function bookmarksRouter(req, res) {
  const path = req.url.split('?')[0];

  // If the path ends exactly with /bookmarks or /bookmarks/
  if (path.match(/\/bookmarks\/?$/)) {
    return indexHandler(req, res);
  }

  // Otherwise, it must be /bookmarks/[id]
  const match = path.match(/\/bookmarks\/([^\/]+)\/?$/);
  if (match) {
    req.query = req.query || {};
    req.query.id = match[1];
    return idHandler(req, res);
  }

  res.status(404).json({ error: 'Not Found' });
}
