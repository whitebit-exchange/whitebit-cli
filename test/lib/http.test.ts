import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { createAuthHeaders } from '../../src/lib/auth';
import { HttpClient } from '../../src/lib/http';
import type { RateLimitCategory } from '../../src/lib/rate-limiter';
import { DEFAULT_USER_AGENT } from '../../src/lib/version';

const FIXED_NONCE = 1700000000000;
const API_URL = 'https://whitebit.com';
const API_KEY = 'test-key';
const API_SECRET = 'test-secret';

type RequestInput = string | URL | Request;
type FetchCall = { input: RequestInput; init?: RequestInit };

let originalDateNow: typeof Date.now;

const setDateNow = (fn: typeof Date.now): void => {
  Object.defineProperty(Date, 'now', {
    value: fn,
    configurable: true,
    writable: true,
  });
};

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });

const getHeader = (init: RequestInit | undefined, name: string): string | null => {
  const headers = new Headers(init?.headers);
  return headers.get(name);
};

const toFetchMock = (
  handler: (input: RequestInput, init?: RequestInit) => Promise<Response>,
): typeof fetch =>
  Object.assign(handler, {
    preconnect: fetch.preconnect.bind(fetch),
  });

describe('HttpClient', () => {
  beforeEach(() => {
    originalDateNow = Date.now;
    setDateNow(() => FIXED_NONCE);
  });

  afterEach(() => {
    setDateNow(originalDateNow);
  });

  test('sends no auth headers for public GET requests', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({ success: true, result: [{ ticker_id: 'BTC_USDT' }] });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });

    const response = await client.get('/api/v4/public/tickers');
    const request = calls[0];

    expect(request).toBeDefined();
    expect(getHeader(request?.init, 'X-TXC-APIKEY')).toBeNull();
    expect(getHeader(request?.init, 'X-TXC-PAYLOAD')).toBeNull();
    expect(getHeader(request?.init, 'X-TXC-SIGNATURE')).toBeNull();
    expect(getHeader(request?.init, 'User-Agent')).toBe(DEFAULT_USER_AGENT);
    expect(response.success).toBe(true);
  });

  test('sends auth headers for private POST requests', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({ balance: '10.5' });
    });

    const endpointPath = '/api/v4/trade-balance';
    const body = { ticker: 'BTC' };

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });

    await client.post(endpointPath, body);

    const request = calls[0];
    const expectedHeaders = createAuthHeaders(API_KEY, API_SECRET, endpointPath, body);
    const expectedPayload = JSON.parse(
      Buffer.from(expectedHeaders['X-TXC-PAYLOAD'], 'base64').toString('utf8'),
    );

    expect(getHeader(request?.init, 'X-TXC-APIKEY')).toBe(expectedHeaders['X-TXC-APIKEY']);
    expect(getHeader(request?.init, 'X-TXC-PAYLOAD')).toBe(expectedHeaders['X-TXC-PAYLOAD']);
    expect(getHeader(request?.init, 'X-TXC-SIGNATURE')).toBe(expectedHeaders['X-TXC-SIGNATURE']);
    expect(request?.init?.body).toBe(JSON.stringify(expectedPayload));
  });

  test('applies rate limiting per request category', async () => {
    const acquiredCategories: RateLimitCategory[] = [];
    const fetchMock = toFetchMock(async () => createJsonResponse({ success: true }));

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      rateLimiter: {
        acquire: async (category) => {
          acquiredCategories.push(category);
        },
      },
      userAgent: DEFAULT_USER_AGENT,
    });

    await client.get('/api/v4/public/tickers', undefined, { category: 'public' });
    await client.post('/api/v4/trade-balance', {}, { category: 'account' });

    expect(acquiredCategories).toEqual(['public', 'account']);
  });

  test('retries on transient failures', async () => {
    let attempts = 0;

    const fetchMock = toFetchMock(async () => {
      attempts += 1;
      if (attempts === 1) {
        return createJsonResponse({ message: 'rate limit' }, 429);
      }

      return createJsonResponse({ success: true, result: [] }, 200);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      fetch: fetchMock,
      retrySleep: async () => {},
      userAgent: DEFAULT_USER_AGENT,
    });

    const response = await client.get('/api/v4/public/tickers');

    expect(response.success).toBe(true);
    expect(attempts).toBe(2);
  });

  test('sets default user-agent header on all requests', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({ success: true });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
    });

    await client.get('/api/v4/public/tickers');
    await client.post('/api/v4/trade-balance', {});

    expect(getHeader(calls[0]?.init, 'User-Agent')).toBe(DEFAULT_USER_AGENT);
    expect(getHeader(calls[1]?.init, 'User-Agent')).toBe(DEFAULT_USER_AGENT);
  });

  test('normalizes public endpoint errors', async () => {
    const fetchMock = toFetchMock(async () =>
      createJsonResponse({
        success: false,
        message: 'Market not available',
        params: { market: 'BAD_PAIR' },
      }),
    );

    const client = new HttpClient({
      apiUrl: API_URL,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });

    const response = await client.get('/api/v4/public/tickers');

    expect(response.success).toBe(false);
    expect(response.error?.message).toBe('Market not available');
    expect(response.error?.params).toEqual({ market: 'BAD_PAIR' });
  });

  test('normalizes private endpoint errors', async () => {
    const fetchMock = toFetchMock(async () =>
      createJsonResponse(
        {
          code: 422,
          message: 'Validation failed',
          errors: {
            ticker: ['Ticker is required'],
          },
        },
        400,
      ),
    );

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });

    const response = await client.post('/api/v4/trade-balance', {});

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe(422);
    expect(response.error?.message).toBe('Validation failed');
    expect(response.error?.errors).toEqual({
      ticker: ['Ticker is required'],
    });
  });
});
