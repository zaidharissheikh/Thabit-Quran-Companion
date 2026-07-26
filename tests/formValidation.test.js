import { describe, expect, it } from 'vitest'
import {
  ageFromIsoDate,
  getPasswordChecks,
  isPasswordStrong,
  maxDobIsoForMinAge,
  validateDob,
  validateEmail,
  validateName,
} from '../src/lib/formValidation'

describe('password rules', () => {
  it('requires length, case, digit, and special', () => {
    expect(isPasswordStrong('Short1!')).toBe(false)
    expect(isPasswordStrong('longenough1!')).toBe(false)
    expect(isPasswordStrong('Longenough!')).toBe(false)
    expect(isPasswordStrong('Longenough1')).toBe(false)
    expect(isPasswordStrong('Longenough1!')).toBe(true)
    expect(getPasswordChecks('Abcdef1!').length).toBe(true)
  })

  it('rejects over 20 characters', () => {
    expect(isPasswordStrong('Aa1!' + 'x'.repeat(17))).toBe(false)
  })
})

describe('email and name', () => {
  it('validates email shape', () => {
    expect(validateEmail('')).toBeTruthy()
    expect(validateEmail('not-an-email')).toBeTruthy()
    expect(validateEmail('a@b.co')).toBe('')
  })

  it('validates name', () => {
    expect(validateName('A')).toBeTruthy()
    expect(validateName('Fatima')).toBe('')
  })
})

describe('date of birth age gate', () => {
  it('blocks under 11', () => {
    const now = new Date(2026, 6, 27)
    const tenYearsIso = maxDobIsoForMinAge(10, now)
    expect(ageFromIsoDate(tenYearsIso, now)).toBe(10)
    expect(validateDob(tenYearsIso, 11)).toMatch(/at least 11/)
  })

  it('allows exactly 11', () => {
    const now = new Date(2026, 6, 27)
    const elevenIso = maxDobIsoForMinAge(11, now)
    expect(ageFromIsoDate(elevenIso, now)).toBe(11)
    expect(validateDob(elevenIso, 11)).toBe('')
  })
})
