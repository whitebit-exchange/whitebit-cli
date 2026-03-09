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

  async markets(): Promise<NormalizedApiResponse<Record<string, MarketInfo>>> {
    return this.httpClient.get<Record<string, MarketInfo>>('/api/v4/public/markets', undefined, {
      category: 'public',
    });
  }

  async marketStatus(): Promise<NormalizedApiResponse<MarketStatus[]>> {
    return this.httpClient.get<MarketStatus[]>('/api/v4/public/market-status', undefined, {
      category: 'public',
    });
  }

  async assetStatus(): Promise<NormalizedApiResponse<Record<string, AssetStatus>>> {
    return this.httpClient.get<Record<string, AssetStatus>>('/api/v4/public/assets', undefined, {
      category: 'public',
    });
  }

  async availableFuturesMarkets(): Promise<NormalizedApiResponse<string[]>> {
    return this.httpClient.get<string[]>('/api/v4/public/futures', undefined, {
      category: 'public',
    });
  }

  async collateralMarkets(): Promise<NormalizedApiResponse<string[]>> {
    return this.httpClient.get<string[]>('/api/v4/public/collateral/markets', undefined, {
      category: 'public',
    });
  }

  async tickers(): Promise<NormalizedApiResponse<Record<string, TickerData>>> {
    return this.httpClient.get<Record<string, TickerData>>('/api/v4/public/tickers', undefined, {
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

    return this.httpClient.get<KlineRecord[]>(
      `/api/v4/public/kline/${params.market}`,
      queryParams,
      {
        category: 'public',
      },
    );
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
    const queryParams: Record<string, string | number> = {
      market: params.market,
    };

    if (params.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params.offset !== undefined) {
      queryParams.offset = params.offset;
    }

    return this.httpClient.get<FundingRecord[]>('/api/v4/public/funding-history', queryParams, {
      category: 'public',
    });
  }

  async miningPoolOverview(): Promise<NormalizedApiResponse<MiningPoolData>> {
    return this.httpClient.get<MiningPoolData>('/api/v4/public/platform/mining-pool', undefined, {
      category: 'public',
    });
  }

  async marketActivity(): Promise<NormalizedApiResponse<MarketActivityData>> {
    return this.httpClient.get<MarketActivityData>('/api/v4/public/ticker', undefined, {
      category: 'public',
    });
  }
}
