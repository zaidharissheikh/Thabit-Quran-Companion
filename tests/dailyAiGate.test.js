import { describe, expect, it, vi } from 'vitest';
import { createDailyAiGate } from '../src/lib/dailyAiGate.js';

describe('dailyAiGate', () => {
  it('only runs execute once when called concurrently with empty cache', async () => {
    const gate = createDailyAiGate();
    const execute = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });

    const results = await Promise.all([
      gate.run('nudge', {
        force: false,
        hasCachedToday: false,
        onUseCache: () => {},
        execute,
      }),
      gate.run('nudge', {
        force: false,
        hasCachedToday: false,
        onUseCache: () => {},
        execute,
      }),
      gate.run('nudge', {
        force: false,
        hasCachedToday: false,
        onUseCache: () => {},
        execute,
      }),
    ]);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(results.filter((r) => r === 'ran')).toHaveLength(1);
    expect(results.filter((r) => r === 'skipped-inflight')).toHaveLength(2);
  });

  it('skips after syncFromCache for today', async () => {
    const gate = createDailyAiGate();
    const today = new Date().toISOString().split('T')[0];
    gate.syncFromCache('reflection', { date: today, text: 'cached question' });

    const execute = vi.fn(async () => {});
    const onUseCache = vi.fn();
    const result = await gate.run('reflection', {
      force: false,
      hasCachedToday: true,
      onUseCache,
      execute,
    });

    expect(result).toBe('skipped-done');
    expect(execute).not.toHaveBeenCalled();
    expect(onUseCache).toHaveBeenCalled();
  });

  it('force still respects in-flight lock', async () => {
    const gate = createDailyAiGate();
    let release;
    const blocking = new Promise((r) => {
      release = r;
    });
    const execute = vi.fn(async () => blocking);

    const first = gate.run('reflection', {
      force: true,
      hasCachedToday: false,
      onUseCache: () => {},
      execute,
    });
    await Promise.resolve();
    const second = await gate.run('reflection', {
      force: true,
      hasCachedToday: false,
      onUseCache: () => {},
      execute,
    });
    expect(second).toBe('skipped-inflight');
    release();
    await first;
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
