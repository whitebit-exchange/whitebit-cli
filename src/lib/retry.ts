export interface RetryOptions {
  sleep?: (ms: number) => Promise<void>;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  if ('status' in error && typeof error.status === 'number') {
    return error.status;
  }

  return undefined;
};

const shouldRetry = (error: unknown): boolean => {
  const status = getStatusCode(error);
  if (status === undefined) {
    return false;
  }

  return status === 429 || (status >= 500 && status <= 599);
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  options: RetryOptions = {},
): Promise<T> => {
  const sleepFn = options.sleep ?? sleep;
  let retries = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = 1000 * 2 ** retries;
      retries += 1;
      await sleepFn(delay);
    }
  }
};
