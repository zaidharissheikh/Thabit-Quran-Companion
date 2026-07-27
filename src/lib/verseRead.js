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
 * Write keys for a day into localStorage (cache).
 * @param {string} day
 * @param {string[]} keys
 */
export function setReadVerseKeysForDay(day, keys) {
  const list = Array.isArray(keys) ? [...new Set(keys.map(String))] : []
  localStorage.setItem(storageKey(day), JSON.stringify(list))
}

/**
 * Hydrate local cache from Mongo readLogs.
 * @param {Record<string, string[]>} readLogs
 */
export function hydrateLocalReadLogs(readLogs = {}) {
  if (!readLogs || typeof readLogs !== 'object') return
  for (const [day, keys] of Object.entries(readLogs)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Array.isArray(keys)) continue
    const existing = getReadVerseKeysForDay(day)
    const merged = [...new Set([...existing, ...keys.map(String)])]
    setReadVerseKeysForDay(day, merged)
  }
}

/**
 * Collect local read logs for the lookback window.
 * @param {number} [lookbackDays]
 * @returns {Record<string, string[]>}
 */
export function collectLocalReadLogs(lookbackDays = 60) {
  const out = {}
  for (let i = 0; i < lookbackDays; i += 1) {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const day = localDateKey(d)
    if (!hasReadLogForDay(day)) continue
    const keys = getReadVerseKeysForDay(day)
    if (keys.length > 0) out[day] = keys
  }
  return out
}

/**
 * @param {Record<string, string[]>} readLogs
 * @param {number} [maxDays]
 */
export function pruneReadLogs(readLogs = {}, maxDays = 60) {
  const entries = Object.entries(readLogs || {})
    .filter(([day, keys]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Array.isArray(keys) && keys.length > 0)
    .map(([day, keys]) => [day, [...new Set(keys.map(String))]])
    .sort((a, b) => a[0].localeCompare(b[0]))

  const trimmed = entries.slice(-maxDays)
  return Object.fromEntries(trimmed)
}

/**
 * Merge server + local unique-ayah maps (union per day).
 * @param {Record<string, string[]>} server
 * @param {Record<string, string[]>} local
 */
export function mergeReadLogs(server = {}, local = {}) {
  const days = new Set([
    ...Object.keys(server || {}),
    ...Object.keys(local || {}),
  ])
  const out = {}
  for (const day of days) {
    const merged = [
      ...new Set([
        ...((server && server[day]) || []),
        ...((local && local[day]) || []),
      ].map(String)),
    ]
    if (merged.length > 0) out[day] = merged
  }
  return pruneReadLogs(out, 60)
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
 * Build session rows from Mongo sessions + synced readLogs.
 * Prefer unique-ayah counts from readLogs when present; keep Mongo
 * session rows for days that only exist on the server.
 *
 * @param {Array<{ date: string, verses?: number, heart?: number }>} existingSessions
 * @param {Record<string, string[]>} readLogs
 */
export function mergeSessionsWithReadLogs(existingSessions = [], readLogs = {}) {
  const byDate = new Map()

  for (const s of existingSessions || []) {
    if (!s?.date) continue
    byDate.set(s.date, {
      date: s.date,
      verses: Math.max(0, Number(s.verses) || 0),
      heart: s.heart ?? 3,
    })
  }

  for (const [day, keys] of Object.entries(readLogs || {})) {
    if (!Array.isArray(keys)) continue
    const verses = keys.length
    if (verses <= 0) continue
    const prev = byDate.get(day)
    byDate.set(day, {
      date: day,
      verses,
      heart: prev?.heart ?? 3,
    })
  }

  return [...byDate.values()]
    .filter((s) => (s.verses || 0) > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-60)
}

/**
 * @deprecated Prefer mergeSessionsWithReadLogs(serverSessions, readLogs)
 */
export function sessionsFromReadLogs(existingSessions = [], lookbackDays = 60) {
  const local = collectLocalReadLogs(lookbackDays)
  return mergeSessionsWithReadLogs(existingSessions, local)
}
