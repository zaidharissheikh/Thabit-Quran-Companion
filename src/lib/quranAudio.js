/**
 * Public ayah audio (Mishary Alafasy) via EveryAyah CDN.
 * @param {number} surahId
 * @param {number} ayahNumber
 */
export function ayahAudioUrl(surahId, ayahNumber) {
  const s = String(surahId).padStart(3, '0')
  const a = String(ayahNumber).padStart(3, '0')
  return `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`
}

/**
 * @param {number} seconds
 */
export function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
