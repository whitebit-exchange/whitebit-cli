import { describe, expect, test } from 'bun:test';

import {
  type RateLimitCategory,
  type RateLimitConfig,
  RateLimiter,
} from '../../src/lib/rate-limiter';

const createLimits = (limit: number, windowMs: number): RateLimitConfig => ({
  public: { limit, windowMs },
  trading: { limit, windowMs },
  'trading-query': { limit, windowMs },
  account: { limit, windowMs },
  collateral: { limit, windowMs },
  'collateral-trading': { limit, windowMs },
  convert: { limit, windowMs },
  'sub-account': { limit, windowMs },
});

const createLimiter = (
  options: {
    now?: () => number;
    sleep?: (ms: number) => Promise<void>;
    limit?: number;
    windowMs?: number;
  } = {},
): RateLimiter =>
  new RateLimiter({
    now: options.now,
    sleep: options.sleep,
    limits: createLimits(options.limit ?? 2, options.windowMs ?? 100),
  });

describe('RateLimiter', () => {
  test('allows requests within rate limit', async () => {
    let now = 0;
    const sleepCalls: number[] = [];

    const limiter = createLimiter({
      now: () => now,
      sleep: async (ms) => {
        sleepCalls.push(ms);
        now += ms;
      },
      limit: 2,
      windowMs: 100,
    });

    await limiter.acquire('public');
    await limiter.acquire('public');

    expect(sleepCalls).toEqual([]);
  });

  test('delays requests when limit is reached', async () => {
    let now = 0;
    const sleepCalls: number[] = [];

    const limiter = createLimiter({
      now: () => now,
      sleep: async (ms) => {
        sleepCalls.push(ms);
        now += ms;
      },
      limit: 2,
      windowMs: 100,
    });

    await limiter.acquire('public');
    await limiter.acquire('public');
    await limiter.acquire('public');

    expect(sleepCalls).toEqual([100]);
  });

  test('resets counters after the time window', async () => {
    let now = 0;
    const sleepCalls: number[] = [];

    const limiter = createLimiter({
      now: () => now,
      sleep: async (ms) => {
        sleepCalls.push(ms);
        now += ms;
      },
      limit: 2,
      windowMs: 100,
    });

    await limiter.acquire('public');
    await limiter.acquire('public');

    now = 100;
    await limiter.acquire('public');

    expect(sleepCalls).toEqual([]);
  });

  test('tracks each category independently', async () => {
    let now = 0;
    const sleepCalls: number[] = [];

    const limiter = createLimiter({
      now: () => now,
      sleep: async (ms) => {
        sleepCalls.push(ms);
        now += ms;
      },
      limit: 1,
      windowMs: 100,
    });

    await limiter.acquire('public');
    await limiter.acquire('trading');
    await limiter.acquire('public');

    expect(sleepCalls).toEqual([100]);
  });

  test('supports all documented categories', async () => {
    const categories: RateLimitCategory[] = [
      'public',
      'trading',
      'trading-query',
      'account',
      'collateral',
      'convert',
      'sub-account',
    ];

    const limiter = createLimiter({ limit: 2, windowMs: 100 });

    for (const category of categories) {
      await limiter.acquire(category);
    }

    expect(categories.length).toBe(7);
  });
});
