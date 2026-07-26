const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SPECIAL_RE = /[^A-Za-z0-9]/

/** Password: 8–20 chars, upper, lower, digit, special */
export function getPasswordChecks(password = '') {
  const value = String(password)
  return {
    length: value.length >= 8 && value.length <= 20,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /\d/.test(value),
    special: SPECIAL_RE.test(value),
  }
}

export function isPasswordStrong(password) {
  const checks = getPasswordChecks(password)
  return Object.values(checks).every(Boolean)
}

export function passwordErrorMessage(password) {
  if (!password) return 'Password is required'
  const checks = getPasswordChecks(password)
  if (!checks.length) return 'Password must be 8–20 characters'
  if (!checks.upper) return 'Add at least one uppercase letter'
  if (!checks.lower) return 'Add at least one lowercase letter'
  if (!checks.digit) return 'Add at least one digit'
  if (!checks.special) return 'Add at least one special character'
  return ''
}

export function validateName(name) {
  const value = String(name || '').trim()
  if (!value) return 'Full name is required'
  if (value.length < 2) return 'Name must be at least 2 characters'
  if (value.length > 80) return 'Name must be under 80 characters'
  return ''
}

export function validateEmail(email) {
  const value = String(email || '').trim()
  if (!value) return 'Email is required'
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address'
  return ''
}

export function validateLoginPassword(password) {
  if (!String(password || '')) return 'Password is required'
  return ''
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return ''
}

/**
 * @param {string} isoDate YYYY-MM-DD
 * @param {number} [minAge]
 */
export function ageFromIsoDate(isoDate, now = new Date()) {
  if (!isoDate) return null
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return null
  const birth = new Date(y, m - 1, d)
  if (Number.isNaN(birth.getTime())) return null
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

export function maxDobIsoForMinAge(minAge = 11, now = new Date()) {
  const d = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate())
  return toIsoDate(d)
}

export function toIsoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return ''
  return `${m}/${d}/${y}`
}

export function validateDob(isoDate, minAge = 11) {
  if (!isoDate) return 'Date of birth is required'
  const age = ageFromIsoDate(isoDate)
  if (age === null) return 'Enter a valid date of birth'
  if (age < minAge) return `You must be at least ${minAge} years old`
  if (age > 120) return 'Enter a valid date of birth'
  return ''
}

export const PASSWORD_RULES = [
  { key: 'length', label: '8–20 characters' },
  { key: 'upper', label: 'One uppercase letter' },
  { key: 'lower', label: 'One lowercase letter' },
  { key: 'digit', label: 'One digit' },
  { key: 'special', label: 'One special character' },
]
