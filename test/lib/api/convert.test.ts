import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { ConvertApi } from '../../../src/lib/api/convert';
import { HttpClient } from '../../../src/lib/http';
import { DEFAULT_USER_AGENT } from '../../../src/lib/version';

const FIXED_NONCE = 1700000000000;
const API_URL = 'https://whitebit.com';
const API_KEY = 'test-key';
const API_SECRET = 'test-secret';

type RequestInput = string | URL | Request;

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

const toFetchMock = (
  handler: (input: RequestInput, init?: RequestInit) => Promise<Response>,
): typeof fetch =>
  Object.assign(handler, {
    preconnect: fetch.preconnect.bind(fetch),
  });

describe('ConvertApi', () => {
  beforeEach(() => {
    originalDateNow = Date.now;
    setDateNow(() => FIXED_NONCE);
  });

  afterEach(() => {
    setDateNow(originalDateNow);
  });

  test('estimate: sends correct request and returns conversion estimate', async () => {
    const fetchMock = toFetchMock(async () =>
      createJsonResponse({
        id: 'est-123',
        from: 'BTC',
        to: 'USDT',
        fromAmount: '0.1',
        toAmount: '4250.5',
        rate: '42505',
        expiresAt: 1700000300,
      }),
    );

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    const api = new ConvertApi(client);

    const result = await api.estimate({
      from: 'BTC',
      to: 'USDT',
      amount: '0.1',
    });

    expect(result.id).toBe('est-123');
    expect(result.from).toBe('BTC');
    expect(result.to).toBe('USDT');
    expect(result.fromAmount).toBe('0.1');
    expect(result.toAmount).toBe('4250.5');
  });

  test('confirm: sends correct request and confirms conversion', async () => {
    const fetchMock = toFetchMock(async () =>
      createJsonResponse({
        transactionId: 'txn-456',
        fromAmount: '0.1',
        toAmount: '4250.5',
        from: 'BTC',
        to: 'USDT',
        rate: '42505',
        timestamp: 1700000100,
        status: 'completed',
      }),
    );

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    const api = new ConvertApi(client);

    const result = await api.confirm({
      estimateId: 'est-123',
    });

    expect(result.transactionId).toBe('txn-456');
    expect(result.status).toBe('completed');
    expect(result.from).toBe('BTC');
    expect(result.to).toBe('USDT');
  });

  test('history: sends correct request and returns conversion history', async () => {
    const fetchMock = toFetchMock(async () =>
      createJsonResponse({
        records: [
          {
            transactionId: 'txn-789',
            from: 'ETH',
            to: 'BTC',
            fromAmount: '1.5',
            toAmount: '0.08',
            rate: '0.0533',
            timestamp: 1700000200,
            status: 'completed',
          },
        ],
        total: 1,
      }),
    );

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    const api = new ConvertApi(client);

    const result = await api.history({
      limit: 50,
      offset: 0,
    });

    expect(result.records).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.records?.[0]?.transactionId).toBe('txn-789');
    expect(result.records?.[0]?.status).toBe('completed');
  });
});
