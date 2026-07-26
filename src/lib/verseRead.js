import { localDateKey } from './localDay'

/**
 * @param {number} surahId
 * @param {number} ayahNumber
 */
export function verseReadKey(surahId, ayahNumber) {
  return `${Number(surahId)}:${Number(ayahNumber)}`
}

function storageKey(day = localDateKey()) {
  return `thabit_read_${day}`
}

/**
 * @param {string} [day] YYYY-MM-DD
 * @returns {string[]}
 */
export function getReadVerseKeysForDay(day = localDateKey()) {
  try {
    const raw = localStorage.getItem(storageKey(day))
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/**
 * True when this browser has a read-log entry for that day (even if empty array).
 * @param {string} [day]
 */
export function hasReadLogForDay(day = localDateKey()) {
  return localStorage.getItem(storageKey(day)) !== null
}

/**
 * @param {string} [day]
 */
export function getReadCountForDay(day = localDateKey()) {
  return getReadVerseKeysForDay(day).length
}

export function getReadVerseKeysToday() {
  return getReadVerseKeysForDay()
}

/**
 * @param {number} surahId
 * @param {number} ayahNumber
 */
export function hasReadVerseToday(surahId, ayahNumber) {
  return getReadVerseKeysToday().includes(verseReadKey(surahId, ayahNumber))
}

/**
 * Mark a verse as read for today. Returns true if newly counted.
 * @param {number} surahId
 * @param {number} ayahNumber
 */
export function claimVerseReadToday(surahId, ayahNumber) {
  const key = storageKey()
  const list = getReadVerseKeysForDay()
  const verseKey = verseReadKey(surahId, ayahNumber)
  if (list.includes(verseKey)) return false
  list.push(verseKey)
  localStorage.setItem(key, JSON.stringify(list))
  return true
}

/**
 * Rebuild session rows from per-day ayah read logs (real unique ayahs).
 * Drops legacy inflated session counts that have no matching read log
 * (e.g. old "log remaining goal" dumps).
 *
 * @param {Array<{ date: string, verses?: number, heart?: number }>} existingSessions
 * @param {number} [lookbackDays]
 */
export function sessionsFromReadLogs(existingSessions = [], lookbackDays = 60) {
  const heartByDate = new Map(
    (existingSessions || []).map((s) => [s.date, s.heart ?? 3]),
  )
  const out = []

  for (let i = 0; i < lookbackDays; i += 1) {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const day = localDateKey(d)
    if (!hasReadLogForDay(day)) continue
    const verses = getReadCountForDay(day)
    if (verses <= 0) continue
    out.push({
      date: day,
      verses,
      heart: heartByDate.get(day) ?? 3,
    })
  }

  return out.sort((a, b) => a.date.localeCompare(b.date))
}
