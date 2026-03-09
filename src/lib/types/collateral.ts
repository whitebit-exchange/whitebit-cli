// Collateral Trading API Types

export type OrderSide = 'buy' | 'sell';
export type PositionSide = 'long' | 'short';

// Request types
export interface CreateLimitOrderParams {
  market: string;
  side: OrderSide;
  amount: string;
  price: string;
  leverage?: number;
  clientOrderId?: string;
  postOnly?: boolean;
  ioc?: boolean;
  rpi?: boolean;
}

export interface CreateMarketOrderParams {
  market: string;
  side: OrderSide;
  amount: string;
  leverage?: number;
  clientOrderId?: string;
}

export interface BulkOrderItem {
  side: OrderSide;
  amount: string;
  price: string;
  leverage?: number;
  clientOrderId?: string;
}

export interface CreateBulkOrdersParams {
  market: string;
  orders: BulkOrderItem[];
}

export interface CreateStopLimitOrderParams {
  market: string;
  side: OrderSide;
  amount: string;
  price: string;
  activation_price: string;
  leverage?: number;
  clientOrderId?: string;
}

export interface CreateTriggerMarketOrderParams {
  market: string;
  side: OrderSide;
  amount: string;
  activation_price: string;
  leverage?: number;
  clientOrderId?: string;
}

export interface SetLeverageParams {
  market: string;
  leverage: number;
}

export interface SetHedgeModeParams {
  enabled: boolean;
}

export interface ClosePositionParams {
  market: string;
  positionId?: number;
}

export interface OpenPositionsParams {
  market?: string;
}

export interface PositionHistoryParams {
  market?: string;
  limit?: number;
  offset?: number;
}

export interface FundingHistoryParams {
  market?: string;
  limit?: number;
  offset?: number;
}

export interface UnexecutedConditionalOrdersParams {
  market?: string;
}

export interface CancelConditionalOrderParams {
  market: string;
  orderId: number;
}

export interface UnexecutedOcoOrdersParams {
  market?: string;
}

export interface CreateOcoOrderParams {
  market: string;
  side: OrderSide;
  amount: string;
  price: string;
  stop_price: string;
  leverage?: number;
  clientOrderId?: string;
}

export interface CreateOtoOrderParams {
  market: string;
  side: OrderSide;
  amount: string;
  price: string;
  trigger_price: string;
  leverage?: number;
  clientOrderId?: string;
}

export interface CancelOcoOrderParams {
  market: string;
  orderId: number;
}

export interface CancelOtoOrderParams {
  market: string;
  orderId: number;
}

// Response types
export interface CollateralBalance {
  [ticker: string]: {
    available: string;
    freeze: string;
  };
}

export interface CollateralSummary {
  balance: string;
  margin: string;
  unrealizedPnL: string;
  marginLevel: string;
  positions: number;
}

export interface BalanceSummaryAsset {
  ticker: string;
  available: string;
  freeze: string;
  equity: string;
  unrealizedPnL: string;
}

export interface CollateralBalanceSummary {
  summary: {
    equity: string;
    margin: string;
    freeMargin: string;
    marginLevel: string;
    unrealizedPnL: string;
  };
  assets: BalanceSummaryAsset[];
}

export interface HedgeModeStatus {
  enabled: boolean;
}

export interface CollateralOrder {
  orderId: number;
  clientOrderId?: string;
  market: string;
  side: OrderSide;
  type: string;
  timestamp: number;
  dealMoney: string;
  dealStock: string;
  amount: string;
  takerFee: string;
  makerFee: string;
  left: string;
  dealFee: string;
  price?: string;
  activation_price?: string;
  leverage?: number;
}

export interface Position {
  id: number;
  market: string;
  side: PositionSide;
  amount: string;
  basePrice: string;
  liquidationPrice: string;
  leverage: number;
  margin: string;
  unrealizedPnL: string;
  realizedPnL: string;
  timestamp: number;
}

export interface PositionHistoryItem {
  id: number;
  market: string;
  side: PositionSide;
  amount: string;
  openPrice: string;
  closePrice: string;
  leverage: number;
  margin: string;
  realizedPnL: string;
  openTime: number;
  closeTime: number;
}

export interface FundingHistoryItem {
  id: number;
  market: string;
  amount: string;
  rate: string;
  timestamp: number;
}

export interface ConditionalOrder {
  orderId: number;
  clientOrderId?: string;
  market: string;
  side: OrderSide;
  type: string;
  amount: string;
  price?: string;
  activation_price: string;
  leverage?: number;
  timestamp: number;
}

export interface OcoOrder {
  orderId: number;
  clientOrderId?: string;
  market: string;
  side: OrderSide;
  amount: string;
  price: string;
  stop_price: string;
  leverage?: number;
  timestamp: number;
}

export interface LeverageResult {
  market: string;
  leverage: number;
}
