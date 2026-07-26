/**
 * Shared password / auth field rules (must match frontend formValidation.js).
 */

const SPECIAL_RE = /[^A-Za-z0-9]/

export function getPasswordChecks(password = '') {
  const value = String(password);
  return {
    length: value.length >= 8 && value.length <= 20,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /\d/.test(value),
    special: SPECIAL_RE.test(value),
  };
}

export function isPasswordStrong(password) {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}

export const STRONG_PASSWORD_MESSAGE =
  'Password must be 8–20 characters and include uppercase, lowercase, a digit, and a special character';

/**
 * @param {string} isoDate YYYY-MM-DD
 * @param {Date} [now]
 */
export function ageFromIsoDate(isoDate, now = new Date()) {
  if (!isoDate || typeof isoDate !== 'string') return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const birth = new Date(y, m - 1, d);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAtLeastAge(isoDate, minAge = 11, now = new Date()) {
  const age = ageFromIsoDate(isoDate, now);
  return age !== null && age >= minAge && age <= 120;
}
