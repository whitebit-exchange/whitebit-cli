import type { HttpClient } from '../http';
import type {
  AllFeesResponse,
  Balance,
  CancelAllOrdersParams,
  CancelOrderParams,
  CreateBulkOrdersParams,
  CreateBuyStockMarketOrderParams,
  CreateLimitOrderParams,
  CreateMarketOrderParams,
  CreateStopLimitOrderParams,
  CreateStopMarketOrderParams,
  ExecutedDealsParams,
  ExecutedOrdersParams,
  KillSwitchStatus,
  KillSwitchSyncParams,
  MarketFee,
  MarketFeeParams,
  ModifyOrderParams,
  Order,
  Trade,
  TradesHistoryParams,
  UnexecutedOrdersParams,
} from '../types/trade';

export class TradeApi {
  constructor(private readonly httpClient: HttpClient) {}

  async createLimitOrder(params: CreateLimitOrderParams): Promise<Order> {
    const response = await this.httpClient.post<Order>(
      '/api/v4/order/new',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create limit order');
    }

    return response.data;
  }

  async createMarketOrder(params: CreateMarketOrderParams): Promise<Order> {
    const response = await this.httpClient.post<Order>(
      '/api/v4/order/market',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create market order');
    }

    return response.data;
  }

  async createBulkOrders(params: CreateBulkOrdersParams): Promise<Order[]> {
    const response = await this.httpClient.post<Order[]>(
      '/api/v4/order/bulk',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create bulk orders');
    }

    return response.data;
  }

  async createStopLimitOrder(params: CreateStopLimitOrderParams): Promise<Order> {
    const response = await this.httpClient.post<Order>(
      '/api/v4/order/stop_limit',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create stop limit order');
    }

    return response.data;
  }

  async createStopMarketOrder(params: CreateStopMarketOrderParams): Promise<Order> {
    const response = await this.httpClient.post<Order>(
      '/api/v4/order/stop_market',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create stop market order');
    }

    return response.data;
  }

  async createBuyStockMarketOrder(params: CreateBuyStockMarketOrderParams): Promise<Order> {
    const response = await this.httpClient.post<Order>(
      '/api/v4/order/stock_market',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create buy stock market order');
    }

    return response.data;
  }

  async cancelOrder(params: CancelOrderParams): Promise<Order> {
    const response = await this.httpClient.post<Order>(
      '/api/v4/order/cancel',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to cancel order');
    }

    return response.data;
  }

  async cancelAllOrders(params: CancelAllOrdersParams = {}): Promise<Order[]> {
    const response = await this.httpClient.post<Order[]>(
      '/api/v4/order/cancel/all',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to cancel all orders');
    }

    return response.data;
  }

  async modifyOrder(params: ModifyOrderParams): Promise<Order> {
    const response = await this.httpClient.post<Order>(
      '/api/v4/order/modify',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to modify order');
    }

    return response.data;
  }

  async executedOrders(params: ExecutedOrdersParams = {}): Promise<Order[]> {
    const response = await this.httpClient.post<Order[]>(
      '/api/v4/trade-account/order/history',
      params as Record<string, unknown>,
      {
        category: 'trading-query',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch executed orders');
    }

    return response.data;
  }

  async unexecutedOrders(params: UnexecutedOrdersParams = {}): Promise<Order[]> {
    const response = await this.httpClient.post<Order[]>(
      '/api/v4/orders',
      params as Record<string, unknown>,
      {
        category: 'trading-query',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch unexecuted orders');
    }

    return response.data;
  }

  async executedDeals(params: ExecutedDealsParams): Promise<Trade[]> {
    const response = await this.httpClient.post<Trade[]>(
      '/api/v4/trade-account/order',
      params as Record<string, unknown>,
      {
        category: 'trading-query',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch executed deals');
    }

    return response.data;
  }

  async tradesHistory(params: TradesHistoryParams = {}): Promise<Trade[]> {
    const response = await this.httpClient.post<Trade[]>(
      '/api/v4/trade-account/executed-history',
      params as Record<string, unknown>,
      {
        category: 'trading-query',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch trades history');
    }

    return response.data;
  }

  async tradeBalance(): Promise<Balance> {
    const response = await this.httpClient.post<Balance>(
      '/api/v4/trade-account/balance',
      {},
      {
        category: 'account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch trade balance');
    }

    return response.data;
  }

  async marketFee(params: MarketFeeParams): Promise<MarketFee> {
    const response = await this.httpClient.post<MarketFee>(
      '/api/v4/market/fee',
      params as Record<string, unknown>,
      {
        category: 'account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch market fee');
    }

    return response.data;
  }

  async allFees(): Promise<AllFeesResponse> {
    const response = await this.httpClient.post<AllFeesResponse>(
      '/api/v4/market/fee',
      {},
      {
        category: 'account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch all fees');
    }

    return response.data;
  }

  async killSwitchStatus(): Promise<KillSwitchStatus> {
    const response = await this.httpClient.post<KillSwitchStatus>(
      '/api/v4/order/kill-switch/status',
      {},
      {
        category: 'account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch kill switch status');
    }

    return response.data;
  }

  async killSwitchSync(params: KillSwitchSyncParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/order/kill-switch',
      params as Record<string, unknown>,
      {
        category: 'trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to sync kill switch');
    }

    return response.data;
  }
}
