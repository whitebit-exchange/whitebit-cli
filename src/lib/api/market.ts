import type { NormalizedApiResponse } from '../http';
import { HttpClient, type HttpClientOptions } from '../http';
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
} from '../types/market';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const unwrapResult = <T>(value: unknown): T => {
  if (isRecord(value) && 'result' in value) {
    return value.result as T;
  }

  if (isRecord(value) && 'data' in value) {
    return value.data as T;
  }

  return value as T;
};

export class MarketApi {
  private readonly httpClient: HttpClient;

  constructor(options: HttpClientOptions) {
    this.httpClient = new HttpClient(options);
  }

  async serverTime(): Promise<NormalizedApiResponse<ServerTime>> {
    return this.httpClient.get<ServerTime>('/api/v4/public/time', undefined, {
      category: 'public',
    });
  }

  async status(): Promise<NormalizedApiResponse<ServerStatus>> {
    return this.httpClient.get<ServerStatus>('/api/v4/public/ping', undefined, {
      category: 'public',
    });
  }

  async markets(): Promise<NormalizedApiResponse<MarketInfo[]>> {
    return this.httpClient.get<MarketInfo[]>('/api/v4/public/markets', undefined, {
      category: 'public',
    });
  }

  async marketStatus(): Promise<NormalizedApiResponse<MarketStatus[]>> {
    const marketsResponse = await this.markets();
    if (!marketsResponse.success) {
      return {
        success: false,
        error: marketsResponse.error,
      };
    }

    const statuses: MarketStatus[] = (marketsResponse.data ?? []).map((market) => ({
      market: market.name,
      status: market.tradesEnabled ? 'active' : 'inactive',
    }));

    return {
      success: true,
      data: statuses,
    };
  }

  async assetStatus(): Promise<NormalizedApiResponse<Record<string, AssetStatus>>> {
    return this.httpClient.get<Record<string, AssetStatus>>('/api/v4/public/assets', undefined, {
      category: 'public',
    });
  }

  async availableFuturesMarkets(): Promise<NormalizedApiResponse<string[]>> {
    const response = await this.httpClient.get<unknown>('/api/v4/public/futures', undefined, {
      category: 'public',
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: unwrapResult<string[]>(response.data),
    };
  }

  async collateralMarkets(): Promise<NormalizedApiResponse<string[]>> {
    const response = await this.httpClient.get<unknown>(
      '/api/v4/public/collateral/markets',
      undefined,
      {
        category: 'public',
      },
    );

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: unwrapResult<string[]>(response.data),
    };
  }

  async tickers(): Promise<NormalizedApiResponse<Record<string, TickerData>>> {
    return this.httpClient.get<Record<string, TickerData>>('/api/v4/public/ticker', undefined, {
      category: 'public',
    });
  }

  async depth(params: {
    market: string;
    limit?: number;
  }): Promise<NormalizedApiResponse<OrderbookDepth>> {
    return this.httpClient.get<OrderbookDepth>(
      `/api/v4/public/orderbook/${params.market}`,
      params.limit !== undefined ? { limit: params.limit } : undefined,
      { category: 'public' },
    );
  }

  async trades(params: {
    market: string;
    type?: 'buy' | 'sell';
  }): Promise<NormalizedApiResponse<TradeRecord[]>> {
    return this.httpClient.get<TradeRecord[]>(
      `/api/v4/public/trades/${params.market}`,
      params.type !== undefined ? { type: params.type } : undefined,
      { category: 'public' },
    );
  }

  async kline(params: {
    market: string;
    interval: string;
    start?: number;
    end?: number;
    limit?: number;
  }): Promise<NormalizedApiResponse<KlineRecord[]>> {
    const queryParams: Record<string, string | number> = {
      market: params.market,
      interval: params.interval,
    };

    if (params.start !== undefined) {
      queryParams.start = params.start;
    }
    if (params.end !== undefined) {
      queryParams.end = params.end;
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit;
    }

    const response = await this.httpClient.get<unknown>('/api/v1/public/kline', queryParams, {
      category: 'public',
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: unwrapResult<KlineRecord[]>(response.data),
    };
  }

  async fee(): Promise<NormalizedApiResponse<FeeInfo[]>> {
    return this.httpClient.get<FeeInfo[]>('/api/v4/public/fee', undefined, {
      category: 'public',
    });
  }

  async fundingHistory(params: {
    market: string;
    limit?: number;
    offset?: number;
  }): Promise<NormalizedApiResponse<FundingRecord[]>> {
    const queryParams: Record<string, string | number> = {};

    if (params.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params.offset !== undefined) {
      queryParams.offset = params.offset;
    }

    return this.httpClient.get<FundingRecord[]>(
      `/api/v4/public/funding-history/${params.market}`,
      queryParams,
      {
        category: 'public',
      },
    );
  }

  async miningPoolOverview(): Promise<NormalizedApiResponse<MiningPoolData>> {
    const response = await this.httpClient.get<unknown>('/api/v4/public/mining-pool', undefined, {
      category: 'public',
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: unwrapResult<MiningPoolData>(response.data),
    };
  }

  async marketActivity(): Promise<NormalizedApiResponse<MarketActivityData>> {
    return this.httpClient.get<MarketActivityData>('/api/v4/public/ticker', undefined, {
      category: 'public',
    });
  }
}
