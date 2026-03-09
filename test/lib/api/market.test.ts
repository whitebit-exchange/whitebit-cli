import { beforeEach, describe, expect, test } from 'bun:test';

import { MarketApi } from '../../../src/lib/api/market';
import type {
  AssetStatus,
  FeeInfo,
  FundingRecord,
  KlineRecord,
  MarketActivityData,
  MarketInfo,
  MarketStatus,
  MiningPoolData,
  OrderbookDepth,
  ServerStatus,
  ServerTime,
  TickerData,
  TradeRecord,
} from '../../../src/lib/types/market';

const API_URL = 'https://whitebit.com';

const createMockFetch =
  (mockResponse: unknown, status = 200) =>
  async (): Promise<Response> =>
    ({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    }) as Response;

describe('MarketApi', () => {
  let api: MarketApi;

  beforeEach(() => {
    api = new MarketApi({ apiUrl: API_URL });
  });

  describe('serverTime', () => {
    test('returns server time', async () => {
      const mockData: ServerTime = { time: 1631451591 };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.serverTime();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.data?.time).toBe(1631451591);
    });

    test('handles error response', async () => {
      const mockError = { success: false, message: 'Server error' };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockError, 500),
        retryMaxRetries: 0,
      });

      const result = await api.serverTime();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Server error');
    });
  });

  describe('status', () => {
    test('returns server status', async () => {
      const mockData: ServerStatus = { status: 'operational' };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.status();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('operational');
    });
  });

  describe('markets', () => {
    test('returns markets info', async () => {
      const mockData: Record<string, MarketInfo> = {
        BTC_USDT: {
          name: 'BTC_USDT',
          stock: 'BTC',
          money: 'USDT',
          stockPrec: '8',
          moneyPrec: '2',
          feePrec: '4',
          makerFee: '0.001',
          takerFee: '0.001',
          minAmount: '0.0001',
          minTotal: '10',
          tradesEnabled: true,
        },
      };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.markets();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('BTC_USDT');
      expect(result.data?.BTC_USDT.stock).toBe('BTC');
    });
  });

  describe('marketStatus', () => {
    test('returns market status list', async () => {
      const mockData: MarketStatus[] = [
        { market: 'BTC_USDT', status: 'operational' },
        { market: 'ETH_USDT', status: 'operational' },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.marketStatus();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].market).toBe('BTC_USDT');
    });
  });

  describe('assetStatus', () => {
    test('returns asset status', async () => {
      const mockData: Record<string, AssetStatus> = {
        BTC: {
          canDeposit: true,
          canWithdraw: true,
          networks: {
            BTC: {
              canDeposit: true,
              canWithdraw: true,
              depositMinAmount: '0.0001',
              withdrawMinAmount: '0.001',
              withdrawMaxAmount: '10',
            },
          },
        },
      };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.assetStatus();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('BTC');
      expect(result.data?.BTC.canDeposit).toBe(true);
    });
  });

  describe('availableFuturesMarkets', () => {
    test('returns futures markets list', async () => {
      const mockData: string[] = ['BTC_USDT_PERP', 'ETH_USDT_PERP'];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.availableFuturesMarkets();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0]).toBe('BTC_USDT_PERP');
    });
  });

  describe('collateralMarkets', () => {
    test('returns collateral markets list', async () => {
      const mockData: string[] = ['BTC_USDT', 'ETH_USDT'];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.collateralMarkets();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0]).toBe('BTC_USDT');
    });
  });

  describe('tickers', () => {
    test('returns tickers data', async () => {
      const mockData: Record<string, TickerData> = {
        BTC_USDT: {
          ticker_id: 'BTC_USDT',
          base_currency: 'BTC',
          quote_currency: 'USDT',
          last_price: '50000',
          base_volume: '100',
          quote_volume: '5000000',
          isFrozen: '0',
          change: '0.5',
          ask: '50001',
          bid: '49999',
          high: '51000',
          low: '49000',
          volume: '100',
          deal: '5000000',
          at: 1631451591,
        },
      };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.tickers();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('BTC_USDT');
      expect(result.data?.BTC_USDT.last_price).toBe('50000');
    });
  });

  describe('depth', () => {
    test('returns orderbook depth with required market param', async () => {
      const mockData: OrderbookDepth = {
        timestamp: 1631451591,
        asks: [
          ['50001', '1.5'],
          ['50002', '2.0'],
        ],
        bids: [
          ['49999', '1.2'],
          ['49998', '1.8'],
        ],
      };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.depth({ market: 'BTC_USDT' });

      expect(result.success).toBe(true);
      expect(result.data?.asks.length).toBe(2);
      expect(result.data?.bids.length).toBe(2);
      expect(result.data?.asks[0][0]).toBe('50001');
    });

    test('supports optional limit param', async () => {
      const mockData: OrderbookDepth = {
        timestamp: 1631451591,
        asks: [['50001', '1.5']],
        bids: [['49999', '1.2']],
      };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.depth({ market: 'BTC_USDT', limit: 1 });

      expect(result.success).toBe(true);
      expect(result.data?.asks.length).toBe(1);
    });
  });

  describe('trades', () => {
    test('returns recent trades with required market param', async () => {
      const mockData: TradeRecord[] = [
        { tradeId: 12345, price: '50000', volume: '0.5', time: 1631451591, type: 'buy' },
        { tradeId: 12346, price: '49999', volume: '0.3', time: 1631451592, type: 'sell' },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.trades({ market: 'BTC_USDT' });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].tradeId).toBe(12345);
    });

    test('supports optional type filter', async () => {
      const mockData: TradeRecord[] = [
        { tradeId: 12345, price: '50000', volume: '0.5', time: 1631451591, type: 'buy' },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.trades({ market: 'BTC_USDT', type: 'buy' });

      expect(result.success).toBe(true);
      expect(result.data?.[0].type).toBe('buy');
    });
  });

  describe('kline', () => {
    test('returns kline data with required params', async () => {
      const mockData: KlineRecord[] = [
        {
          time: 1631451600,
          open: '49500',
          close: '50000',
          high: '50100',
          low: '49400',
          volume: '100',
          deal: '5000000',
        },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.kline({ market: 'BTC_USDT', interval: '1h' });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].close).toBe('50000');
    });

    test('supports optional start, end, and limit params', async () => {
      const mockData: KlineRecord[] = [
        {
          time: 1631451600,
          open: '49500',
          close: '50000',
          high: '50100',
          low: '49400',
          volume: '100',
          deal: '5000000',
        },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.kline({
        market: 'BTC_USDT',
        interval: '1h',
        start: 1631400000,
        end: 1631500000,
        limit: 100,
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
    });
  });

  describe('fee', () => {
    test('returns fee info', async () => {
      const mockData: FeeInfo[] = [
        {
          ticker: 'BTC',
          name: 'Bitcoin',
          canDeposit: true,
          canWithdraw: true,
          deposit: {
            minFlex: '0.0001',
            maxFlex: '100',
          },
          withdraw: {
            minFlex: '0.001',
            maxFlex: '10',
            minFee: '0.0005',
            maxFee: '0.001',
          },
        },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.fee();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].ticker).toBe('BTC');
    });
  });

  describe('fundingHistory', () => {
    test('returns funding history with required market param', async () => {
      const mockData: FundingRecord[] = [
        { market: 'BTC_USDT_PERP', time: 1631451591, fundingRate: '0.0001' },
        { market: 'BTC_USDT_PERP', time: 1631451592, fundingRate: '0.00012' },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.fundingHistory({ market: 'BTC_USDT_PERP' });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].market).toBe('BTC_USDT_PERP');
    });

    test('supports optional limit and offset params', async () => {
      const mockData: FundingRecord[] = [
        { market: 'BTC_USDT_PERP', time: 1631451591, fundingRate: '0.0001' },
      ];
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.fundingHistory({ market: 'BTC_USDT_PERP', limit: 50, offset: 0 });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
    });
  });

  describe('miningPoolOverview', () => {
    test('returns mining pool data', async () => {
      const mockData: MiningPoolData = {
        hashrate: '123456789',
        hashrateUnit: 'TH/s',
        workers: 150,
        lastUpdate: 1631451591,
      };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.miningPoolOverview();

      expect(result.success).toBe(true);
      expect(result.data?.workers).toBe(150);
      expect(result.data?.hashrateUnit).toBe('TH/s');
    });
  });

  describe('marketActivity', () => {
    test('returns market activity data', async () => {
      const mockData: MarketActivityData = {
        BTC_USDT: {
          lastPrice: '50000',
          quoteVolume: '5000000',
          baseVolume: '100',
          change24h: '2.5',
          high24h: '51000',
          low24h: '49000',
        },
        ETH_USDT: {
          lastPrice: '3000',
          quoteVolume: '1000000',
          baseVolume: '333',
          change24h: '1.5',
          high24h: '3100',
          low24h: '2900',
        },
      };
      api = new MarketApi({
        apiUrl: API_URL,
        fetch: createMockFetch(mockData),
      });

      const result = await api.marketActivity();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('BTC_USDT');
      expect(result.data?.BTC_USDT.lastPrice).toBe('50000');
      expect(result.data?.ETH_USDT.change24h).toBe('1.5');
    });
  });
});
