import { AppError } from './errors.js';

/**
 * Extract bare email from `Name <email@domain>` or return trimmed value.
 * @param {string} value
 */
function normalizeEmailAddress(value) {
  const raw = String(value || '').trim();
  const angled = raw.match(/<([^>]+)>/);
  return (angled ? angled[1] : raw).trim();
}

/**
 * Resend sender + support inbox from env only (no hardcoded addresses).
 * @returns {{ fromAddress: string, toEmail: string, apiKey: string }}
 */
export function requireEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromAddress = process.env.RESEND_FROM_EMAIL?.trim();
  const toRaw =
    process.env.SUPPORT_TO_EMAIL?.trim() || process.env.RESEND_TO_EMAIL?.trim();
  const toEmail = toRaw ? normalizeEmailAddress(toRaw) : '';

  if (!apiKey || !fromAddress || !toEmail) {
    throw new AppError(
      503,
      'EMAIL_NOT_CONFIGURED',
      'Email is not configured yet. Please try again later.',
    );
  }

  return { apiKey, fromAddress, toEmail };
}

/**
 * Sender address for outbound mail (password reset, etc.).
 * @returns {string | null}
 */
export function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || null;
}
