import type { HttpClient } from '../http';
import type {
  CancelConditionalOrderParams,
  CancelOcoOrderParams,
  CancelOtoOrderParams,
  ClosePositionParams,
  CollateralBalance,
  CollateralBalanceSummary,
  CollateralOrder,
  CollateralSummary,
  ConditionalOrder,
  CreateBulkOrdersParams,
  CreateLimitOrderParams,
  CreateMarketOrderParams,
  CreateOcoOrderParams,
  CreateOtoOrderParams,
  CreateStopLimitOrderParams,
  CreateTriggerMarketOrderParams,
  FundingHistoryItem,
  FundingHistoryParams,
  HedgeModeStatus,
  LeverageResult,
  OcoOrder,
  OpenPositionsParams,
  Position,
  PositionHistoryItem,
  PositionHistoryParams,
  SetHedgeModeParams,
  SetLeverageParams,
  UnexecutedConditionalOrdersParams,
  UnexecutedOcoOrdersParams,
} from '../types/collateral';

export class CollateralApi {
  constructor(private readonly httpClient: HttpClient) {}

  async balance(): Promise<CollateralBalance> {
    const response = await this.httpClient.post<CollateralBalance>(
      '/api/v4/collateral-account/balance',
      {},
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch collateral balance');
    }

    return response.data;
  }

  async summary(): Promise<CollateralSummary> {
    const response = await this.httpClient.post<CollateralSummary>(
      '/api/v4/collateral-account/summary',
      {},
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch collateral summary');
    }

    return response.data;
  }

  async balanceSummary(): Promise<CollateralBalanceSummary> {
    const response = await this.httpClient.post<CollateralBalanceSummary>(
      '/api/v4/collateral-account/balance-summary',
      {},
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch collateral balance summary');
    }

    return response.data;
  }

  async getHedgeMode(): Promise<HedgeModeStatus> {
    const response = await this.httpClient.post<HedgeModeStatus>(
      '/api/v4/collateral-account/hedge-mode',
      {},
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch hedge mode status');
    }

    return response.data;
  }

  async setHedgeMode(params: SetHedgeModeParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/collateral-account/hedge-mode/update',
      params,
      {
        category: 'account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to set hedge mode');
    }

    return response.data;
  }

  async createLimitOrder(params: CreateLimitOrderParams): Promise<CollateralOrder> {
    const response = await this.httpClient.post<CollateralOrder>(
      '/api/v4/order/collateral/limit',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create limit order');
    }

    return response.data;
  }

  async createMarketOrder(params: CreateMarketOrderParams): Promise<CollateralOrder> {
    const response = await this.httpClient.post<CollateralOrder>(
      '/api/v4/order/collateral/market',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create market order');
    }

    return response.data;
  }

  async createBulkLimitOrders(params: CreateBulkOrdersParams): Promise<CollateralOrder[]> {
    const response = await this.httpClient.post<CollateralOrder[]>(
      '/api/v4/order/collateral/bulk',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create bulk limit orders');
    }

    return response.data;
  }

  async createStopLimitOrder(params: CreateStopLimitOrderParams): Promise<CollateralOrder> {
    const response = await this.httpClient.post<CollateralOrder>(
      '/api/v4/order/collateral/stop-limit',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create stop limit order');
    }

    return response.data;
  }

  async createTriggerMarketOrder(params: CreateTriggerMarketOrderParams): Promise<CollateralOrder> {
    const response = await this.httpClient.post<CollateralOrder>(
      '/api/v4/order/collateral/trigger-market',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create trigger market order');
    }

    return response.data;
  }

  async setLeverage(params: SetLeverageParams): Promise<LeverageResult> {
    const response = await this.httpClient.post<LeverageResult>(
      '/api/v4/collateral-account/leverage',
      params,
      {
        category: 'account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to set leverage');
    }

    return response.data;
  }

  async closePosition(params: ClosePositionParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/collateral-account/position/close',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to close position');
    }

    return response.data;
  }

  async openPositions(params: OpenPositionsParams = {}): Promise<Position[]> {
    const response = await this.httpClient.post<Position[]>(
      '/api/v4/collateral-account/positions',
      params,
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch open positions');
    }

    return response.data;
  }

  async positionHistory(params: PositionHistoryParams = {}): Promise<PositionHistoryItem[]> {
    const response = await this.httpClient.post<PositionHistoryItem[]>(
      '/api/v4/collateral-account/positions/history',
      params,
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch position history');
    }

    return response.data;
  }

  async fundingHistory(params: FundingHistoryParams = {}): Promise<FundingHistoryItem[]> {
    const response = await this.httpClient.post<FundingHistoryItem[]>(
      '/api/v4/collateral-account/funding-history',
      params,
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch funding history');
    }

    return response.data;
  }

  async unexecutedConditionalOrders(
    params: UnexecutedConditionalOrdersParams = {},
  ): Promise<ConditionalOrder[]> {
    const response = await this.httpClient.post<ConditionalOrder[]>(
      '/api/v4/orders/conditional',
      params,
      {
        category: 'collateral',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch conditional orders');
    }

    return response.data;
  }

  async cancelConditionalOrder(params: CancelConditionalOrderParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/order/conditional-cancel',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to cancel conditional order');
    }

    return response.data;
  }

  async unexecutedOcoOrders(params: UnexecutedOcoOrdersParams = {}): Promise<OcoOrder[]> {
    const response = await this.httpClient.post<OcoOrder[]>('/api/v4/orders/oco', params, {
      category: 'collateral',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch OCO orders');
    }

    return response.data;
  }

  async createOcoOrder(params: CreateOcoOrderParams): Promise<CollateralOrder> {
    const response = await this.httpClient.post<CollateralOrder>(
      '/api/v4/order/collateral/oco',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create OCO order');
    }

    return response.data;
  }

  async createOtoOrder(params: CreateOtoOrderParams): Promise<CollateralOrder> {
    const response = await this.httpClient.post<CollateralOrder>(
      '/api/v4/order/collateral/oto',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create OTO order');
    }

    return response.data;
  }

  async cancelOcoOrder(params: CancelOcoOrderParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/order/oco-cancel',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to cancel OCO order');
    }

    return response.data;
  }

  async cancelOtoOrder(params: CancelOtoOrderParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/order/oto-cancel',
      params,
      {
        category: 'collateral-trading',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to cancel OTO order');
    }

    return response.data;
  }
}
