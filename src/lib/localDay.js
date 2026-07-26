/**
 * Local calendar helpers for streak / daily progress (browser timezone).
 * Day boundary: local midnight.
 */

/**
 * @param {Date} [date]
 * @returns {string} YYYY-MM-DD in local time
 */
export function localDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * @param {Date} [date]
 */
export function localYesterdayKey(date = new Date()) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - 1)
  return localDateKey(d)
}

/**
 * Normalize stored session dates to YYYY-MM-DD when possible.
 * Older clients used labels like "Jul 26".
 * @param {string} dateStr
 * @returns {string | null}
 */
export function normalizeSessionDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr

  const parsed = new Date(dateStr)
  if (!Number.isNaN(parsed.getTime())) {
    return localDateKey(parsed)
  }
  return null
}

/**
 * @param {Array<{ date: string, verses?: number, heart?: number }>} sessions
 */
export function normalizeSessions(sessions) {
  return (sessions || []).map((s) => ({
    ...s,
    date: normalizeSessionDate(s.date) || s.date,
  }))
}

/**
 * When the local calendar day changes, clear today's counter and
 * break the streak if the user missed a day.
 *
 * @param {{ streak?: number, lastReadDate?: string | null, versesReadToday?: number }} progress
 * @param {Date} [now]
 */
export function reconcileDailyProgress(progress, now = new Date()) {
  const today = localDateKey(now)
  const yesterday = localYesterdayKey(now)
  const last = progress.lastReadDate || null
  let streak = progress.streak ?? 0
  let versesReadToday = progress.versesReadToday ?? 0

  if (!last) {
    const changed = streak !== 0 || versesReadToday !== 0
    return { today, streak: 0, versesReadToday: 0, changed }
  }

  if (last === today) {
    return { today, streak, versesReadToday, changed: false }
  }

  versesReadToday = 0

  if (last === yesterday) {
    return {
      today,
      streak,
      versesReadToday,
      changed: (progress.versesReadToday ?? 0) !== 0,
    }
  }

  streak = 0
  return {
    today,
    streak,
    versesReadToday,
    changed:
      (progress.streak ?? 0) !== 0 || (progress.versesReadToday ?? 0) !== 0,
  }
}

/**
 * Set today's verse count to an absolute unique-ayah total (from the read log).
 *
 * @param {{ sessions?: Array, heartRating?: number }} progress
 * @param {number} versesToday
 */
export function applyAbsoluteVerseCount(progress, versesToday) {
  const today = localDateKey()
  const count = Math.max(0, Number(versesToday) || 0)
  const sessions = normalizeSessions(progress.sessions || [])
  const idx = sessions.findIndex((s) => s.date === today)

  if (count <= 0) {
    if (idx >= 0) sessions.splice(idx, 1)
  } else if (idx >= 0) {
    sessions[idx] = {
      ...sessions[idx],
      verses: count,
      heart: progress.heartRating ?? sessions[idx].heart ?? 3,
    }
  } else {
    sessions.push({
      date: today,
      verses: count,
      heart: progress.heartRating ?? 3,
    })
  }

  while (sessions.length > 60) sessions.shift()

  return {
    versesReadToday: count,
    streak: computeStreakFromSessions(sessions),
    sessions,
    lastReadDate: count > 0 ? today : progress.lastReadDate || null,
    addedVerses: 1,
  }
}

/**
 * @deprecated Prefer applyAbsoluteVerseCount after claiming a unique ayah read.
 */
export function applyVerseLog(progress, addedVerses = 1) {
  const today = localDateKey()
  let currentVersesToday = progress.versesReadToday ?? 0
  const last = progress.lastReadDate || null
  if (last && last !== today) currentVersesToday = 0
  return applyAbsoluteVerseCount(progress, currentVersesToday + addedVerses)
}

/**
 * Streak = consecutive local days (ending today or yesterday) with verses > 0.
 * @param {Array<{ date: string, verses?: number }>} sessions
 * @param {Date} [now]
 */
export function computeStreakFromSessions(sessions, now = new Date()) {
  const dates = new Set(
    normalizeSessions(sessions)
      .filter((s) => (s.verses || 0) > 0)
      .map((s) => s.date),
  )

  if (dates.size === 0) return 0

  const cursor = new Date(now)
  cursor.setHours(12, 0, 0, 0)
  const todayKey = localDateKey(cursor)
  if (!dates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (dates.has(localDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/**
 * Time-of-day greeting in local time.
 * @param {Date} [now]
 */
export function greetingForNow(now = new Date()) {
  const hour = now.getHours()
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}
