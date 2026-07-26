import { describe, expect, it } from 'vitest'
import {
  applyVerseLog,
  computeStreakFromSessions,
  greetingForNow,
  localDateKey,
} from '../src/lib/localDay.js'

describe('greetingForNow', () => {
  it('says good night late at night', () => {
    const d = new Date()
    d.setHours(23, 30, 0, 0)
    expect(greetingForNow(d)).toBe('Good night')
  })

  it('says good morning before noon', () => {
    const d = new Date()
    d.setHours(9, 0, 0, 0)
    expect(greetingForNow(d)).toBe('Good morning')
  })
})

describe('applyVerseLog', () => {
  it('adds exactly one verse and uses ISO session dates', () => {
    const today = localDateKey()
    const result = applyVerseLog(
      {
        versesReadToday: 0,
        streak: 0,
        lastReadDate: null,
        sessions: [],
        heartRating: 3,
      },
      1,
    )
    expect(result.addedVerses).toBe(1)
    expect(result.versesReadToday).toBe(1)
    expect(result.streak).toBe(1)
    expect(result.sessions[0].date).toBe(today)
    expect(result.sessions[0].verses).toBe(1)
  })
})

describe('computeStreakFromSessions', () => {
  it('counts consecutive days ending today', () => {
    const today = localDateKey()
    const y = new Date()
    y.setHours(12, 0, 0, 0)
    y.setDate(y.getDate() - 1)
    const yesterday = localDateKey(y)
    expect(
      computeStreakFromSessions([
        { date: yesterday, verses: 2 },
        { date: today, verses: 1 },
      ]),
    ).toBe(2)
  })
})
