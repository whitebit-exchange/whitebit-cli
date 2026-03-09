import { describe, expect, test } from 'bun:test';

import { withRetry } from '../../src/lib/retry';

const createError = (status: number, message = `status-${status}`): Error & { status: number } => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

describe('withRetry', () => {
  test('succeeds on the first try', async () => {
    let attempts = 0;
    const sleepCalls: number[] = [];

    const result = await withRetry(
      async () => {
        attempts += 1;
        return 'ok';
      },
      3,
      {
        sleep: async (ms) => {
          sleepCalls.push(ms);
        },
      },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(1);
    expect(sleepCalls).toEqual([]);
  });

  test('retries on 429 with exponential backoff', async () => {
    let attempts = 0;
    const sleepCalls: number[] = [];

    const result = await withRetry(
      async () => {
        attempts += 1;
        if (attempts <= 3) {
          throw createError(429, 'too-many-requests');
        }

        return 'recovered';
      },
      3,
      {
        sleep: async (ms) => {
          sleepCalls.push(ms);
        },
      },
    );

    expect(result).toBe('recovered');
    expect(attempts).toBe(4);
    expect(sleepCalls).toEqual([1000, 2000, 4000]);
  });

  test('retries on 5xx errors', async () => {
    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw createError(503, 'service-unavailable');
        }

        return 'ok';
      },
      3,
      {
        sleep: async () => {},
      },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });

  test('does not retry on non-429 4xx errors', async () => {
    let attempts = 0;
    let thrownError: unknown;

    try {
      await withRetry(async () => {
        attempts += 1;
        throw createError(400, 'bad-request');
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect((thrownError as Error).message).toBe('bad-request');
    expect(attempts).toBe(1);
  });

  test('gives up after max retries', async () => {
    let attempts = 0;
    const sleepCalls: number[] = [];
    let thrownError: unknown;

    try {
      await withRetry(
        async () => {
          attempts += 1;
          throw createError(429, 'too-many-requests');
        },
        3,
        {
          sleep: async (ms) => {
            sleepCalls.push(ms);
          },
        },
      );
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect((thrownError as Error).message).toBe('too-many-requests');
    expect(attempts).toBe(4);
    expect(sleepCalls).toEqual([1000, 2000, 4000]);
  });

  test('passes through the final error after exhausting retries', async () => {
    const finalError = createError(500, 'still-failing');
    let thrownError: unknown;

    try {
      await withRetry(async () => {
        throw finalError;
      }, 0);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(finalError);
  });
});
