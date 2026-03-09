export type RateLimitCategory =
  | 'public'
  | 'trading'
  | 'trading-query'
  | 'account'
  | 'collateral'
  | 'convert'
  | 'sub-account';

export interface RateLimitWindow {
  limit: number;
  windowMs: number;
}

export type RateLimitConfig = Record<RateLimitCategory, RateLimitWindow>;

const WINDOW_MS = 10_000;

export const RATE_LIMIT_CONFIG: RateLimitConfig = {
  public: { limit: 2000, windowMs: WINDOW_MS },
  trading: { limit: 10000, windowMs: WINDOW_MS },
  'trading-query': { limit: 12000, windowMs: WINDOW_MS },
  account: { limit: 1000, windowMs: WINDOW_MS },
  collateral: { limit: 12000, windowMs: WINDOW_MS },
  convert: { limit: 1000, windowMs: WINDOW_MS },
  'sub-account': { limit: 1000, windowMs: WINDOW_MS },
};

interface CategoryState {
  queue: Promise<void>;
  timestamps: number[];
}

interface RateLimiterOptions {
  limits?: RateLimitConfig;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class RateLimiter {
  private readonly limits: RateLimitConfig;

  private readonly now: () => number;

  private readonly sleep: (ms: number) => Promise<void>;

  private readonly states: Record<RateLimitCategory, CategoryState>;

  constructor(options: RateLimiterOptions = {}) {
    this.limits = options.limits ?? RATE_LIMIT_CONFIG;
    this.now = options.now ?? Date.now;
    this.sleep = options.sleep ?? sleep;
    this.states = {
      public: { queue: Promise.resolve(), timestamps: [] },
      trading: { queue: Promise.resolve(), timestamps: [] },
      'trading-query': { queue: Promise.resolve(), timestamps: [] },
      account: { queue: Promise.resolve(), timestamps: [] },
      collateral: { queue: Promise.resolve(), timestamps: [] },
      convert: { queue: Promise.resolve(), timestamps: [] },
      'sub-account': { queue: Promise.resolve(), timestamps: [] },
    };
  }

  acquire(category: RateLimitCategory): Promise<void> {
    const state = this.states[category];
    const run = async (): Promise<void> => {
      await this.waitForSlot(category, state);
    };

    const next = state.queue.then(run, run);
    state.queue = next.then(
      () => undefined,
      () => undefined,
    );

    return next;
  }

  private pruneExpired(state: CategoryState, now: number, windowMs: number): void {
    while (state.timestamps.length > 0) {
      const timestamp = state.timestamps[0];
      if (timestamp === undefined) {
        return;
      }

      if (now - timestamp < windowMs) {
        return;
      }

      state.timestamps.shift();
    }
  }

  private async waitForSlot(category: RateLimitCategory, state: CategoryState): Promise<void> {
    const { limit, windowMs } = this.limits[category];

    while (true) {
      const now = this.now();
      this.pruneExpired(state, now, windowMs);

      if (state.timestamps.length < limit) {
        state.timestamps.push(now);
        return;
      }

      const oldestTimestamp = state.timestamps[0];
      if (oldestTimestamp === undefined) {
        continue;
      }

      const waitMs = Math.max(1, windowMs - (now - oldestTimestamp));
      await this.sleep(waitMs);
    }
  }
}
