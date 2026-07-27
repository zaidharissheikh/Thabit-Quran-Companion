import entries from '../data/royalCounsel.json'

/**
 * Returns one Royal Counsel entry that changes every INTERVAL_HOURS hours.
 * The same entry is shown to all users during the same time bucket,
 * and it rotates automatically without any API call or randomness on re-render.
 *
 * @param {number} intervalHours - How many hours each entry lasts (default: 3)
 * @returns {string} The counsel text
 */
export function getRoyalCounsel(intervalHours = 3) {
  const intervalMs = intervalHours * 60 * 60 * 1000
  const bucket = Math.floor(Date.now() / intervalMs)
  return entries[bucket % entries.length]
}
