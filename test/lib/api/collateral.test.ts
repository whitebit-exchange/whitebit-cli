import { describe, expect, test } from 'bun:test';

import { CollateralApi } from '../../../src/lib/api/collateral';
import type { HttpClient } from '../../../src/lib/http';

const createMockHttpClient = (mockResponse: unknown): HttpClient => ({
  get: async () => ({ success: true, data: mockResponse }),
  post: async () => ({ success: true, data: mockResponse }),
});

const createFailingHttpClient = (): HttpClient => ({
  get: async () => ({ success: false, error: {} }),
  post: async () => ({ success: false, error: {} }),
});

describe('CollateralApi', () => {
  test('balance() fetches collateral balance', async () => {
    const mockBalance = { BTC: { available: '1.5', freeze: '0.5' } };
    const client = createMockHttpClient(mockBalance);
    const api = new CollateralApi(client);

    const result = await api.balance();
    expect(result).toEqual(mockBalance);
  });

  test('balance() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.balance()).rejects.toThrow('Failed to fetch collateral balance');
  });

  test('summary() fetches collateral summary', async () => {
    const mockSummary = {
      balance: '1000',
      margin: '500',
      unrealizedPnL: '50',
      marginLevel: '200%',
      positions: 2,
    };
    const client = createMockHttpClient(mockSummary);
    const api = new CollateralApi(client);

    const result = await api.summary();
    expect(result).toEqual(mockSummary);
  });

  test('summary() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.summary()).rejects.toThrow('Failed to fetch collateral summary');
  });

  test('balanceSummary() fetches detailed balance summary', async () => {
    const mockSummary = {
      summary: {
        equity: '1000',
        margin: '500',
        freeMargin: '500',
        marginLevel: '200%',
        unrealizedPnL: '50',
      },
      assets: [
        { ticker: 'BTC', available: '1.0', freeze: '0.5', equity: '1.5', unrealizedPnL: '0.1' },
      ],
    };
    const client = createMockHttpClient(mockSummary);
    const api = new CollateralApi(client);

    const result = await api.balanceSummary();
    expect(result).toEqual(mockSummary);
  });

  test('balanceSummary() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.balanceSummary()).rejects.toThrow('Failed to fetch collateral balance summary');
  });

  test('getHedgeMode() fetches hedge mode status', async () => {
    const mockStatus = { enabled: true };
    const client = createMockHttpClient(mockStatus);
    const api = new CollateralApi(client);

    const result = await api.getHedgeMode();
    expect(result).toEqual(mockStatus);
  });

  test('getHedgeMode() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.getHedgeMode()).rejects.toThrow('Failed to fetch hedge mode status');
  });

  test('setHedgeMode() sets hedge mode', async () => {
    const mockResult = { result: 'success' };
    const client = createMockHttpClient(mockResult);
    const api = new CollateralApi(client);

    const result = await api.setHedgeMode({ enabled: true });
    expect(result).toEqual(mockResult);
  });

  test('setHedgeMode() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.setHedgeMode({ enabled: true })).rejects.toThrow('Failed to set hedge mode');
  });

  test('createLimitOrder() creates a limit order', async () => {
    const mockOrder = {
      orderId: 123,
      market: 'BTC_USDT',
      side: 'buy' as const,
      type: 'limit',
      timestamp: 1700000000,
      dealMoney: '0',
      dealStock: '0',
      amount: '0.01',
      takerFee: '0.1',
      makerFee: '0.1',
      left: '0.01',
      dealFee: '0',
      price: '50000',
    };
    const client = createMockHttpClient(mockOrder);
    const api = new CollateralApi(client);

    const result = await api.createLimitOrder({
      market: 'BTC_USDT',
      side: 'buy',
      amount: '0.01',
      price: '50000',
    });
    expect(result).toEqual(mockOrder);
  });

  test('createLimitOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(
      api.createLimitOrder({ market: 'BTC_USDT', side: 'buy', amount: '0.01', price: '50000' }),
    ).rejects.toThrow('Failed to create limit order');
  });

  test('createMarketOrder() creates a market order', async () => {
    const mockOrder = {
      orderId: 124,
      market: 'BTC_USDT',
      side: 'buy' as const,
      type: 'market',
      timestamp: 1700000000,
      dealMoney: '500',
      dealStock: '0.01',
      amount: '0.01',
      takerFee: '0.1',
      makerFee: '0.1',
      left: '0',
      dealFee: '0.5',
    };
    const client = createMockHttpClient(mockOrder);
    const api = new CollateralApi(client);

    const result = await api.createMarketOrder({ market: 'BTC_USDT', side: 'buy', amount: '0.01' });
    expect(result).toEqual(mockOrder);
  });

  test('createMarketOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(
      api.createMarketOrder({ market: 'BTC_USDT', side: 'buy', amount: '0.01' }),
    ).rejects.toThrow('Failed to create market order');
  });

  test('createBulkLimitOrders() creates multiple orders', async () => {
    const mockOrders = [
      {
        orderId: 125,
        market: 'BTC_USDT',
        side: 'buy' as const,
        type: 'limit',
        timestamp: 1700000000,
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
        orderId: 126,
        market: 'BTC_USDT',
        side: 'sell' as const,
        type: 'limit',
        timestamp: 1700000001,
        dealMoney: '0',
        dealStock: '0',
        amount: '0.01',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0.01',
        dealFee: '0',
        price: '51000',
      },
    ];
    const client = createMockHttpClient(mockOrders);
    const api = new CollateralApi(client);

    const result = await api.createBulkLimitOrders({
      market: 'BTC_USDT',
      orders: [
        { side: 'buy', amount: '0.01', price: '50000' },
        { side: 'sell', amount: '0.01', price: '51000' },
      ],
    });
    expect(result).toEqual(mockOrders);
  });

  test('createBulkLimitOrders() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.createBulkLimitOrders({ market: 'BTC_USDT', orders: [] })).rejects.toThrow(
      'Failed to create bulk limit orders',
    );
  });

  test('createStopLimitOrder() creates a stop limit order', async () => {
    const mockOrder = {
      orderId: 127,
      market: 'BTC_USDT',
      side: 'buy' as const,
      type: 'stop_limit',
      timestamp: 1700000000,
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
    const client = createMockHttpClient(mockOrder);
    const api = new CollateralApi(client);

    const result = await api.createStopLimitOrder({
      market: 'BTC_USDT',
      side: 'buy',
      amount: '0.01',
      price: '50000',
      activation_price: '49000',
    });
    expect(result).toEqual(mockOrder);
  });

  test('createStopLimitOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(
      api.createStopLimitOrder({
        market: 'BTC_USDT',
        side: 'buy',
        amount: '0.01',
        price: '50000',
        activation_price: '49000',
      }),
    ).rejects.toThrow('Failed to create stop limit order');
  });

  test('createTriggerMarketOrder() creates a trigger market order', async () => {
    const mockOrder = {
      orderId: 128,
      market: 'BTC_USDT',
      side: 'buy' as const,
      type: 'trigger_market',
      timestamp: 1700000000,
      dealMoney: '0',
      dealStock: '0',
      amount: '0.01',
      takerFee: '0.1',
      makerFee: '0.1',
      left: '0.01',
      dealFee: '0',
      activation_price: '49000',
    };
    const client = createMockHttpClient(mockOrder);
    const api = new CollateralApi(client);

    const result = await api.createTriggerMarketOrder({
      market: 'BTC_USDT',
      side: 'buy',
      amount: '0.01',
      activation_price: '49000',
    });
    expect(result).toEqual(mockOrder);
  });

  test('createTriggerMarketOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(
      api.createTriggerMarketOrder({
        market: 'BTC_USDT',
        side: 'buy',
        amount: '0.01',
        activation_price: '49000',
      }),
    ).rejects.toThrow('Failed to create trigger market order');
  });

  test('setLeverage() sets leverage for market', async () => {
    const mockResult = { market: 'BTC_USDT', leverage: 10 };
    const client = createMockHttpClient(mockResult);
    const api = new CollateralApi(client);

    const result = await api.setLeverage({ market: 'BTC_USDT', leverage: 10 });
    expect(result).toEqual(mockResult);
  });

  test('setLeverage() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.setLeverage({ market: 'BTC_USDT', leverage: 10 })).rejects.toThrow(
      'Failed to set leverage',
    );
  });

  test('closePosition() closes a position', async () => {
    const mockResult = { result: 'success' };
    const client = createMockHttpClient(mockResult);
    const api = new CollateralApi(client);

    const result = await api.closePosition({ market: 'BTC_USDT' });
    expect(result).toEqual(mockResult);
  });

  test('closePosition() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.closePosition({ market: 'BTC_USDT' })).rejects.toThrow('Failed to close position');
  });

  test('openPositions() fetches open positions', async () => {
    const mockPositions = [
      {
        id: 1,
        market: 'BTC_USDT',
        side: 'long' as const,
        amount: '0.5',
        basePrice: '50000',
        liquidationPrice: '40000',
        leverage: 10,
        margin: '2500',
        unrealizedPnL: '500',
        realizedPnL: '0',
        timestamp: 1700000000,
      },
    ];
    const client = createMockHttpClient(mockPositions);
    const api = new CollateralApi(client);

    const result = await api.openPositions();
    expect(result).toEqual(mockPositions);
  });

  test('openPositions() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.openPositions()).rejects.toThrow('Failed to fetch open positions');
  });

  test('positionHistory() fetches position history', async () => {
    const mockHistory = [
      {
        id: 1,
        market: 'BTC_USDT',
        side: 'long' as const,
        amount: '0.5',
        openPrice: '50000',
        closePrice: '51000',
        leverage: 10,
        margin: '2500',
        realizedPnL: '500',
        openTime: 1700000000,
        closeTime: 1700010000,
      },
    ];
    const client = createMockHttpClient(mockHistory);
    const api = new CollateralApi(client);

    const result = await api.positionHistory();
    expect(result).toEqual(mockHistory);
  });

  test('positionHistory() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.positionHistory()).rejects.toThrow('Failed to fetch position history');
  });

  test('fundingHistory() fetches funding history', async () => {
    const mockHistory = [
      { id: 1, market: 'BTC_USDT', amount: '1.5', rate: '0.01', timestamp: 1700000000 },
    ];
    const client = createMockHttpClient(mockHistory);
    const api = new CollateralApi(client);

    const result = await api.fundingHistory();
    expect(result).toEqual(mockHistory);
  });

  test('fundingHistory() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.fundingHistory()).rejects.toThrow('Failed to fetch funding history');
  });

  test('unexecutedConditionalOrders() fetches conditional orders', async () => {
    const mockOrders = [
      {
        orderId: 129,
        market: 'BTC_USDT',
        side: 'buy' as const,
        type: 'stop_limit',
        amount: '0.01',
        price: '50000',
        activation_price: '49000',
        timestamp: 1700000000,
      },
    ];
    const client = createMockHttpClient(mockOrders);
    const api = new CollateralApi(client);

    const result = await api.unexecutedConditionalOrders();
    expect(result).toEqual(mockOrders);
  });

  test('unexecutedConditionalOrders() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.unexecutedConditionalOrders()).rejects.toThrow('Failed to fetch conditional orders');
  });

  test('cancelConditionalOrder() cancels a conditional order', async () => {
    const mockResult = { result: 'success' };
    const client = createMockHttpClient(mockResult);
    const api = new CollateralApi(client);

    const result = await api.cancelConditionalOrder({ market: 'BTC_USDT', orderId: 129 });
    expect(result).toEqual(mockResult);
  });

  test('cancelConditionalOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.cancelConditionalOrder({ market: 'BTC_USDT', orderId: 129 })).rejects.toThrow(
      'Failed to cancel conditional order',
    );
  });

  test('unexecutedOcoOrders() fetches OCO orders', async () => {
    const mockOrders = [
      {
        orderId: 130,
        market: 'BTC_USDT',
        side: 'buy' as const,
        amount: '0.01',
        price: '50000',
        stop_price: '49000',
        timestamp: 1700000000,
      },
    ];
    const client = createMockHttpClient(mockOrders);
    const api = new CollateralApi(client);

    const result = await api.unexecutedOcoOrders();
    expect(result).toEqual(mockOrders);
  });

  test('unexecutedOcoOrders() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.unexecutedOcoOrders()).rejects.toThrow('Failed to fetch OCO orders');
  });

  test('createOcoOrder() creates an OCO order', async () => {
    const mockOrder = {
      orderId: 131,
      market: 'BTC_USDT',
      side: 'buy' as const,
      type: 'oco',
      timestamp: 1700000000,
      dealMoney: '0',
      dealStock: '0',
      amount: '0.01',
      takerFee: '0.1',
      makerFee: '0.1',
      left: '0.01',
      dealFee: '0',
      price: '50000',
    };
    const client = createMockHttpClient(mockOrder);
    const api = new CollateralApi(client);

    const result = await api.createOcoOrder({
      market: 'BTC_USDT',
      side: 'buy',
      amount: '0.01',
      price: '50000',
      stop_price: '49000',
    });
    expect(result).toEqual(mockOrder);
  });

  test('createOcoOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(
      api.createOcoOrder({
        market: 'BTC_USDT',
        side: 'buy',
        amount: '0.01',
        price: '50000',
        stop_price: '49000',
      }),
    ).rejects.toThrow('Failed to create OCO order');
  });

  test('createOtoOrder() creates an OTO order', async () => {
    const mockOrder = {
      orderId: 132,
      market: 'BTC_USDT',
      side: 'buy' as const,
      type: 'oto',
      timestamp: 1700000000,
      dealMoney: '0',
      dealStock: '0',
      amount: '0.01',
      takerFee: '0.1',
      makerFee: '0.1',
      left: '0.01',
      dealFee: '0',
      price: '50000',
    };
    const client = createMockHttpClient(mockOrder);
    const api = new CollateralApi(client);

    const result = await api.createOtoOrder({
      market: 'BTC_USDT',
      side: 'buy',
      amount: '0.01',
      price: '50000',
      trigger_price: '49000',
    });
    expect(result).toEqual(mockOrder);
  });

  test('createOtoOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(
      api.createOtoOrder({
        market: 'BTC_USDT',
        side: 'buy',
        amount: '0.01',
        price: '50000',
        trigger_price: '49000',
      }),
    ).rejects.toThrow('Failed to create OTO order');
  });

  test('cancelOcoOrder() cancels an OCO order', async () => {
    const mockResult = { result: 'success' };
    const client = createMockHttpClient(mockResult);
    const api = new CollateralApi(client);

    const result = await api.cancelOcoOrder({ market: 'BTC_USDT', orderId: 131 });
    expect(result).toEqual(mockResult);
  });

  test('cancelOcoOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.cancelOcoOrder({ market: 'BTC_USDT', orderId: 131 })).rejects.toThrow(
      'Failed to cancel OCO order',
    );
  });

  test('cancelOtoOrder() cancels an OTO order', async () => {
    const mockResult = { result: 'success' };
    const client = createMockHttpClient(mockResult);
    const api = new CollateralApi(client);

    const result = await api.cancelOtoOrder({ market: 'BTC_USDT', orderId: 132 });
    expect(result).toEqual(mockResult);
  });

  test('cancelOtoOrder() throws on failure', async () => {
    const client = createFailingHttpClient();
    const api = new CollateralApi(client);

    expect(api.cancelOtoOrder({ market: 'BTC_USDT', orderId: 132 })).rejects.toThrow(
      'Failed to cancel OTO order',
    );
  });
});
