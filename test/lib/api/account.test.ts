import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { AccountApi } from '../../../src/lib/api/account';
import { HttpClient } from '../../../src/lib/http';
import { DEFAULT_USER_AGENT } from '../../../src/lib/version';

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

const toFetchMock = (
  handler: (input: RequestInput, init?: RequestInit) => Promise<Response>,
): typeof fetch =>
  Object.assign(handler, {
    preconnect: fetch.preconnect.bind(fetch),
  });

describe('AccountApi', () => {
  let api: AccountApi;

  beforeEach(() => {
    originalDateNow = Date.now;
    setDateNow(() => FIXED_NONCE);
  });

  afterEach(() => {
    setDateNow(originalDateNow);
  });

  test('mainBalance sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        BTC: { main_balance: '1.5' },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.mainBalance();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/balance`);
    expect(result).toEqual({ BTC: { main_balance: '1.5' } });
  });

  test('mainBalance with ticker parameter sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        BTC: { main_balance: '1.5' },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.mainBalance({ ticker: 'BTC' });

    expect(calls).toHaveLength(1);
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.ticker).toBe('BTC');
  });

  test('balance sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        BTC: { available: '1.0', freeze: '0.5' },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.balance();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/trade-account/balance`);
    expect(result).toEqual({ BTC: { available: '1.0', freeze: '0.5' } });
  });

  test('fee sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        BTC_USDT: { makerFee: '0.1', takerFee: '0.1' },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.fee();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/fee`);
    expect(result).toEqual({ BTC_USDT: { makerFee: '0.1', takerFee: '0.1' } });
  });

  test('cryptoDepositAddress sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        account: { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.cryptoDepositAddress({ ticker: 'BTC' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/address`);
    expect(result).toEqual({ account: { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' } });
  });

  test('cryptoDepositAddress with network sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        account: { address: '0xAddress' },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.cryptoDepositAddress({ ticker: 'BTC', network: 'ERC20' });

    expect(calls).toHaveLength(1);
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.ticker).toBe('BTC');
    expect(body.network).toBe('ERC20');
  });

  test('fiatDepositAddress sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        url: 'https://payment.example.com/deposit',
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.fiatDepositAddress({ ticker: 'USD', provider: 'PROVIDER' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/fiat-deposit-url`);
    expect(result).toEqual({ url: 'https://payment.example.com/deposit' });
  });

  test('createAddress sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        account: { address: 'newAddress123' },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.createAddress({ ticker: 'BTC' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/create-new-address`);
    expect(result).toEqual({ account: { address: 'newAddress123' } });
  });

  test('withdrawCrypto sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.withdrawCrypto({
      ticker: 'BTC',
      amount: '0.1',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/withdraw`);
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.ticker).toBe('BTC');
    expect(body.amount).toBe('0.1');
    expect(body.address).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
  });

  test('withdrawCryptoWithAmount sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.withdrawCryptoWithAmount({
      ticker: 'BTC',
      amount: '0.1',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/withdraw-pay`);
  });

  test('withdrawFiat sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.withdrawFiat({
      ticker: 'USD',
      amount: '100',
      provider: 'PROVIDER',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/withdraw-fiat`);
  });

  test('depositRefund sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.depositRefund({ id: 12345 });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/deposit-refund`);
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.id).toBe(12345);
  });

  test('withdrawHistory sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        limit: 50,
        offset: 0,
        records: [],
        total: 0,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.withdrawHistory({ limit: 50, offset: 0 });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/history`);
    expect(result.limit).toBe(50);
  });

  test('transfer sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.transfer({
      ticker: 'BTC',
      amount: '0.1',
      from: 'main',
      to: 'trade',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/transfer`);
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.ticker).toBe('BTC');
    expect(body.amount).toBe('0.1');
    expect(body.from).toBe('main');
    expect(body.to).toBe('trade');
  });

  test('createCode sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        code: 'ABC123',
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.createCode({
      ticker: 'BTC',
      amount: '0.1',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/codes`);
    expect(result.code).toBe('ABC123');
  });

  test('applyCode sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        code: 'ABC123',
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.applyCode({ code: 'ABC123' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/codes-apply`);
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.code).toBe('ABC123');
  });

  test('codesHistory sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        limit: 50,
        offset: 0,
        records: [],
        total: 0,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.codesHistory();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/codes/history`);
    expect(result.limit).toBe(50);
  });

  test('myCodes sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        limit: 50,
        offset: 0,
        records: [],
        total: 0,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.myCodes();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/codes/my`);
    expect(result.limit).toBe(50);
  });

  test('plans sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse([{ id: 'plan1', ticker: 'BTC' }]);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.plans();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/smart/plans`);
    expect(result).toHaveLength(1);
  });

  test('invest sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.invest({ planId: 'plan1', amount: '100' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/smart/investment`);
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.planId).toBe('plan1');
    expect(body.amount).toBe('100');
  });

  test('investmentsHistory sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        limit: 50,
        offset: 0,
        records: [],
        total: 0,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.investmentsHistory();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/smart/investments`);
    expect(result.limit).toBe(50);
  });

  test('closeInvestment sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.closeInvestment({ id: 123 });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart/investment/close`,
    );
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.id).toBe(123);
  });

  test('flexPlans sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse([{ id: 'flexplan1', ticker: 'BTC' }]);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.flexPlans();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/main-account/smart-flex/plans`);
    expect(result).toHaveLength(1);
  });

  test('flexInvest sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.flexInvest({ planId: 'flexplan1', amount: '100' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart-flex/investments/invest`,
    );
  });

  test('flexInvestments sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse([{ id: 1 }]);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.flexInvestments();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart-flex/investments`,
    );
    expect(result).toHaveLength(1);
  });

  test('flexInvestmentHistory sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        limit: 50,
        offset: 0,
        records: [],
        total: 0,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.flexInvestmentHistory();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart-flex/investments/history`,
    );
    expect(result.limit).toBe(50);
  });

  test('flexPaymentHistory sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        limit: 50,
        offset: 0,
        records: [],
        total: 0,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.flexPaymentHistory();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart-flex/investments/payment-history`,
    );
    expect(result.limit).toBe(50);
  });

  test('flexWithdraw sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.flexWithdraw({ id: 1, amount: '50' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart-flex/investments/withdraw`,
    );
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.id).toBe(1);
    expect(body.amount).toBe('50');
  });

  test('flexClose sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.flexClose({ id: 1 });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart-flex/investments/close`,
    );
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.id).toBe(1);
  });

  test('flexAutoReinvest sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        success: true,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    await api.flexAutoReinvest({ id: 1, enabled: true });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart-flex/investments/auto-invest`,
    );
    const body = JSON.parse(calls[0]?.init?.body as string);
    expect(body.id).toBe(1);
    expect(body.enabled).toBe(true);
  });

  test('miningHashrate sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        hashrate: '1000',
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.miningHashrate();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/mining/hashrate`);
    expect(result).toEqual({ hashrate: '1000' });
  });

  test('interestPaymentsHistory sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        limit: 50,
        offset: 0,
        records: [],
        total: 0,
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.interestPaymentsHistory();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(
      `${API_URL}/api/v4/main-account/smart/interest-payment-history`,
    );
    expect(result.limit).toBe(50);
  });

  test('creditLines sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        lines: [],
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.creditLines();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/credit-line/loans/info`);
    expect(result).toEqual({ lines: [] });
  });

  test('issueJwtToken sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        token: 'jwt-token-123',
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.issueJwtToken();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/profile/jwt/issue`);
    expect(result.token).toBe('jwt-token-123');
  });

  test('websocketProfileToken sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      return createJsonResponse({
        token: 'ws-token-123',
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new AccountApi(client);

    const result = await api.websocketProfileToken();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.input.toString()).toBe(`${API_URL}/api/v4/profile/websocket_token`);
    expect(result.token).toBe('ws-token-123');
  });
});
