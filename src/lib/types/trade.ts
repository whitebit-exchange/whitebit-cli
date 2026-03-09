// Spot Trading API Types

export type OrderSide = 'buy' | 'sell';

export interface CreateLimitOrderParams extends Record<string, unknown> {
  market: string;
  side: OrderSide;
  amount: string;
  price: string;
  clientOrderId?: string;
  postOnly?: boolean;
}

export interface CreateMarketOrderParams extends Record<string, unknown> {
  market: string;
  side: OrderSide;
  amount: string;
  clientOrderId?: string;
}

export interface BulkOrderItem {
  side: OrderSide;
  amount: string;
  price: string;
  clientOrderId?: string;
}

export interface CreateBulkOrdersParams extends Record<string, unknown> {
  market: string;
  orders: BulkOrderItem[];
}

export interface CreateStopLimitOrderParams extends Record<string, unknown> {
  market: string;
  side: OrderSide;
  amount: string;
  price: string;
  activation_price: string;
  clientOrderId?: string;
}

export interface CreateStopMarketOrderParams extends Record<string, unknown> {
  market: string;
  side: OrderSide;
  amount: string;
  activation_price: string;
  clientOrderId?: string;
}

export interface CreateBuyStockMarketOrderParams extends Record<string, unknown> {
  market: string;
  amount: string;
  clientOrderId?: string;
}

export interface CancelOrderParams extends Record<string, unknown> {
  market: string;
  orderId: number;
}

export interface CancelAllOrdersParams extends Record<string, unknown> {
  market?: string;
}

export interface ModifyOrderParams extends Record<string, unknown> {
  market: string;
  orderId: number;
  price?: string;
  amount?: string;
}

export interface ExecutedOrdersParams extends Record<string, unknown> {
  market?: string;
  limit?: number;
  offset?: number;
}

export interface UnexecutedOrdersParams extends Record<string, unknown> {
  market?: string;
  limit?: number;
  offset?: number;
}

export interface ExecutedDealsParams extends Record<string, unknown> {
  orderId: number;
  limit?: number;
  offset?: number;
}

export interface TradesHistoryParams extends Record<string, unknown> {
  market?: string;
  limit?: number;
  offset?: number;
}

export interface MarketFeeParams extends Record<string, unknown> {
  market: string;
}

export interface KillSwitchSyncParams extends Record<string, unknown> {
  market: string;
  timeout: number;
}

// Response types
export interface Order {
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
}

export interface Trade {
  id: number;
  time: number;
  side: OrderSide;
  role: number;
  amount: string;
  price: string;
  deal: string;
  fee: string;
}

export interface Balance {
  [ticker: string]: {
    available: string;
    freeze: string;
  };
}

export interface MarketFee {
  makerFee: string;
  takerFee: string;
}

export interface AllFeesResponse {
  [market: string]: MarketFee;
}

export interface KillSwitchStatus {
  status: string;
  timer?: number;
}
