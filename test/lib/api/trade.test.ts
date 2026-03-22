import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { TradeApi } from '../../../src/lib/api/trade';
import { HttpClient } from '../../../src/lib/http';
import type { Balance, KillSwitchStatus, Order, Trade } from '../../../src/lib/types/trade';
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

describe('TradeApi', () => {
  let api: TradeApi;

  beforeEach(() => {
    originalDateNow = Date.now;
    setDateNow(() => FIXED_NONCE);
  });

  afterEach(() => {
    setDateNow(originalDateNow);
  });

  test('createLimitOrder sends correct POST request', async () => {
    const calls: FetchCall[] = [];
    const fetchMock = toFetchMock(async (input, init) => {
      calls.push({ input, init });
      const mockOrder: Order = {
        orderId: 123456,
        market: 'BTC_USDT',
        side: 'buy',
        type: 'limit',
        timestamp: FIXED_NONCE,
        dealMoney: '0',
        dealStock: '0',
        amount: '0.01',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0.01',
        dealFee: '0',
        price: '50000',
      };
      return createJsonResponse(mockOrder);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.createLimitOrder({
      market: 'BTC_USDT',
      side: 'buy',
      amount: '0.01',
      price: '50000',
    });

    expect(calls.length).toBe(1);
    expect(calls[0]?.input.toString()).toContain('/api/v4/order/new');
    expect(result.orderId).toBe(123456);
    expect(result.market).toBe('BTC_USDT');
  });

  test('createMarketOrder sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrder: Order = {
        orderId: 123457,
        market: 'BTC_USDT',
        side: 'sell',
        type: 'market',
        timestamp: FIXED_NONCE,
        dealMoney: '500',
        dealStock: '0.01',
        amount: '0.01',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0',
        dealFee: '0.05',
      };
      return createJsonResponse(mockOrder);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.createMarketOrder({
      market: 'BTC_USDT',
      side: 'sell',
      amount: '0.01',
    });

    expect(result.orderId).toBe(123457);
    expect(result.type).toBe('market');
  });

  test('createBulkOrders sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrders: Order[] = [
        {
          orderId: 123458,
          market: 'BTC_USDT',
          side: 'buy',
          type: 'limit',
          timestamp: FIXED_NONCE,
          dealMoney: '0',
          dealStock: '0',
          amount: '0.01',
          takerFee: '0.1',
          makerFee: '0.1',
          left: '0.01',
          dealFee: '0',
          price: '50000',
        },
        {
          orderId: 123459,
          market: 'BTC_USDT',
          side: 'buy',
          type: 'limit',
          timestamp: FIXED_NONCE,
          dealMoney: '0',
          dealStock: '0',
          amount: '0.02',
          takerFee: '0.1',
          makerFee: '0.1',
          left: '0.02',
          dealFee: '0',
          price: '49000',
        },
      ];
      return createJsonResponse(mockOrders);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.createBulkOrders({
      market: 'BTC_USDT',
      orders: [
        { side: 'buy', amount: '0.01', price: '50000' },
        { side: 'buy', amount: '0.02', price: '49000' },
      ],
    });

    expect(result.length).toBe(2);
    expect(result[0]?.orderId).toBe(123458);
    expect(result[1]?.orderId).toBe(123459);
  });

  test('createStopLimitOrder sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrder: Order = {
        orderId: 123460,
        market: 'BTC_USDT',
        side: 'buy',
        type: 'stop_limit',
        timestamp: FIXED_NONCE,
        dealMoney: '0',
        dealStock: '0',
        amount: '0.01',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0.01',
        dealFee: '0',
        price: '50000',
        activation_price: '49000',
      };
      return createJsonResponse(mockOrder);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.createStopLimitOrder({
      market: 'BTC_USDT',
      side: 'buy',
      amount: '0.01',
      price: '50000',
      activation_price: '49000',
    });

    expect(result.orderId).toBe(123460);
    expect(result.activation_price).toBe('49000');
  });

  test('createStopMarketOrder sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrder: Order = {
        orderId: 123461,
        market: 'BTC_USDT',
        side: 'sell',
        type: 'stop_market',
        timestamp: FIXED_NONCE,
        dealMoney: '0',
        dealStock: '0',
        amount: '0.01',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0.01',
        dealFee: '0',
        activation_price: '51000',
      };
      return createJsonResponse(mockOrder);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.createStopMarketOrder({
      market: 'BTC_USDT',
      side: 'sell',
      amount: '0.01',
      activation_price: '51000',
    });

    expect(result.orderId).toBe(123461);
    expect(result.type).toBe('stop_market');
  });

  test('createBuyStockMarketOrder sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrder: Order = {
        orderId: 123462,
        market: 'BTC_USDT',
        side: 'buy',
        type: 'stock_market',
        timestamp: FIXED_NONCE,
        dealMoney: '100',
        dealStock: '0.002',
        amount: '100',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0',
        dealFee: '0.1',
      };
      return createJsonResponse(mockOrder);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.createBuyStockMarketOrder({
      market: 'BTC_USDT',
      amount: '100',
    });

    expect(result.orderId).toBe(123462);
    expect(result.type).toBe('stock_market');
  });

  test('cancelOrder sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrder: Order = {
        orderId: 123456,
        market: 'BTC_USDT',
        side: 'buy',
        type: 'limit',
        timestamp: FIXED_NONCE,
        dealMoney: '0',
        dealStock: '0',
        amount: '0.01',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0.01',
        dealFee: '0',
        price: '50000',
      };
      return createJsonResponse(mockOrder);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.cancelOrder({
      market: 'BTC_USDT',
      orderId: 123456,
    });

    expect(result.orderId).toBe(123456);
  });

  test('cancelAllOrders sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrders: Order[] = [
        {
          orderId: 123456,
          market: 'BTC_USDT',
          side: 'buy',
          type: 'limit',
          timestamp: FIXED_NONCE,
          dealMoney: '0',
          dealStock: '0',
          amount: '0.01',
          takerFee: '0.1',
          makerFee: '0.1',
          left: '0.01',
          dealFee: '0',
          price: '50000',
        },
      ];
      return createJsonResponse(mockOrders);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.cancelAllOrders({ market: 'BTC_USDT' });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  test('modifyOrder sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrder: Order = {
        orderId: 123456,
        market: 'BTC_USDT',
        side: 'buy',
        type: 'limit',
        timestamp: FIXED_NONCE,
        dealMoney: '0',
        dealStock: '0',
        amount: '0.02',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0.02',
        dealFee: '0',
        price: '49000',
      };
      return createJsonResponse(mockOrder);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.modifyOrder({
      market: 'BTC_USDT',
      orderId: 123456,
      price: '49000',
      amount: '0.02',
    });

    expect(result.orderId).toBe(123456);
    expect(result.price).toBe('49000');
  });

  test('executedOrders sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrders: Order[] = [
        {
          orderId: 123456,
          market: 'BTC_USDT',
          side: 'buy',
          type: 'limit',
          timestamp: FIXED_NONCE,
          dealMoney: '500',
          dealStock: '0.01',
          amount: '0.01',
          takerFee: '0.1',
          makerFee: '0.1',
          left: '0',
          dealFee: '0.05',
          price: '50000',
        },
      ];
      return createJsonResponse(mockOrders);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.executedOrders({ market: 'BTC_USDT', limit: 50 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.orderId).toBe(123456);
  });

  test('unexecutedOrders sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockOrders: Order[] = [
        {
          orderId: 123457,
          market: 'ETH_USDT',
          side: 'sell',
          type: 'limit',
          timestamp: FIXED_NONCE,
          dealMoney: '0',
          dealStock: '0',
          amount: '1.5',
          takerFee: '0.1',
          makerFee: '0.1',
          left: '1.5',
          dealFee: '0',
          price: '3000',
        },
      ];
      return createJsonResponse(mockOrders);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.unexecutedOrders({ market: 'ETH_USDT' });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.left).toBe('1.5');
  });

  test('executedDeals sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockTrades: Trade[] = [
        {
          id: 1,
          time: FIXED_NONCE,
          side: 'buy',
          role: 1,
          amount: '0.01',
          price: '50000',
          deal: '500',
          fee: '0.5',
        },
      ];
      return createJsonResponse(mockTrades);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.executedDeals({ orderId: 123456 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.id).toBe(1);
  });

  test('tradesHistory sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockTrades: Trade[] = [
        {
          id: 2,
          time: FIXED_NONCE,
          side: 'sell',
          role: 2,
          amount: '0.02',
          price: '51000',
          deal: '1020',
          fee: '1.02',
        },
      ];
      return createJsonResponse(mockTrades);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.tradesHistory({ limit: 100 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.price).toBe('51000');
  });

  test('tradeBalance sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockBalance: Balance = {
        BTC: {
          available: '1.5',
          freeze: '0.5',
        },
        USDT: {
          available: '10000',
          freeze: '500',
        },
      };
      return createJsonResponse(mockBalance);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.tradeBalance();

    expect(result.BTC?.available).toBe('1.5');
    expect(result.USDT?.available).toBe('10000');
  });

  test('marketFee sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      return createJsonResponse({
        makerFee: '0.1',
        takerFee: '0.1',
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.marketFee({ market: 'BTC_USDT' });

    expect(result.makerFee).toBe('0.1');
    expect(result.takerFee).toBe('0.1');
  });

  test('allFees sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      return createJsonResponse({
        BTC_USDT: {
          makerFee: '0.1',
          takerFee: '0.1',
        },
        ETH_USDT: {
          makerFee: '0.1',
          takerFee: '0.1',
        },
      });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.allFees();

    expect(result.BTC_USDT?.makerFee).toBe('0.1');
    expect(result.ETH_USDT?.takerFee).toBe('0.1');
  });

  test('killSwitchStatus sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      const mockStatus: KillSwitchStatus = {
        status: 'active',
        timer: 60,
      };
      return createJsonResponse(mockStatus);
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.killSwitchStatus();

    expect(result.status).toBe('active');
    expect(result.timer).toBe(60);
  });

  test('killSwitchSync sends correct POST request', async () => {
    const fetchMock = toFetchMock(async () => {
      return createJsonResponse({ result: 'success' });
    });

    const client = new HttpClient({
      apiUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      fetch: fetchMock,
      userAgent: DEFAULT_USER_AGENT,
    });
    api = new TradeApi(client);

    const result = await api.killSwitchSync({
      market: 'BTC_USDT',
      timeout: 60,
    });

    expect(result.result).toBe('success');
  });
});
