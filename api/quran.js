import chaptersHandler from './_lib/quran/chapters.js';
import chapterIdHandler from './_lib/quran/chapters/[id].js';
import chapterVersesHandler from './_lib/quran/chapters/[id]/verses.js';

export default async function quranRouter(req, res) {
  const path = req.url.split('?')[0];

  if (path.match(/\/quran\/chapters\/?$/)) {
    return chaptersHandler(req, res);
  }

  let match = path.match(/\/quran\/chapters\/([^\/]+)\/verses\/?$/);
  if (match) {
    req.query = req.query || {};
    req.query.id = match[1];
    return chapterVersesHandler(req, res);
  }

  match = path.match(/\/quran\/chapters\/([^\/]+)\/?$/);
  if (match) {
    req.query = req.query || {};
    req.query.id = match[1];
    return chapterIdHandler(req, res);
  }

  res.status(404).json({ error: 'Not Found' });
}
