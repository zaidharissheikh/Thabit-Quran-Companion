/**
 * Session-scoped gate so concurrent generateNudge / generateReflectionQuestion
 * calls cannot both slip past an empty day-cache (production race + StrictMode).
 */

/**
 * @typedef {'nudge' | 'reflection'} DailyAiKind
 */

export function createDailyAiGate() {
  /** @type {Record<DailyAiKind, boolean>} */
  const inFlight = { nudge: false, reflection: false };
  /** @type {Record<DailyAiKind, string | null>} */
  const doneForDate = { nudge: null, reflection: null };

  return {
    /**
     * Sync gate with server-loaded progress (already has today's text).
     * @param {DailyAiKind} kind
     * @param {{ date?: string | null, text?: string }} cached
     */
    syncFromCache(kind, cached) {
      const today = new Date().toISOString().split('T')[0];
      if (cached?.date === today && cached?.text) {
        doneForDate[kind] = today;
        return true;
      }
      return false;
    },

    /**
     * @param {DailyAiKind} kind
     * @param {{
     *   force?: boolean,
     *   hasCachedToday: boolean,
     *   onUseCache: () => void,
     *   execute: () => Promise<void>,
     * }} options
     * @returns {Promise<'ran' | 'skipped-cache' | 'skipped-done' | 'skipped-inflight'>}
     */
    async run(kind, { force = false, hasCachedToday, onUseCache, execute }) {
      const today = new Date().toISOString().split('T')[0];

      if (!force) {
        if (doneForDate[kind] === today) {
          if (hasCachedToday) onUseCache();
          return 'skipped-done';
        }
        if (hasCachedToday) {
          doneForDate[kind] = today;
          onUseCache();
          return 'skipped-cache';
        }
        if (inFlight[kind]) {
          return 'skipped-inflight';
        }
      } else if (inFlight[kind]) {
        return 'skipped-inflight';
      }

      inFlight[kind] = true;
      try {
        await execute();
        doneForDate[kind] = today;
        return 'ran';
      } finally {
        inFlight[kind] = false;
      }
    },

    /** Clear session gates (logout). */
    reset() {
      inFlight.nudge = false;
      inFlight.reflection = false;
      doneForDate.nudge = null;
      doneForDate.reflection = null;
    },
  };
}
