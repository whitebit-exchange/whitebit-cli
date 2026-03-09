// Market Data API Types

export interface ServerTime {
  time: number;
}

export interface ServerStatus {
  status: string;
}

export interface MarketInfo {
  name: string;
  stock: string;
  money: string;
  stockPrec: string;
  moneyPrec: string;
  feePrec: string;
  makerFee: string;
  takerFee: string;
  minAmount: string;
  minTotal: string;
  tradesEnabled: boolean;
  isCollateral?: boolean;
  type?: string;
}

export interface MarketStatus {
  market: string;
  status: string;
}

export interface AssetStatus {
  canDeposit: boolean;
  canWithdraw: boolean;
  networks?: Record<
    string,
    {
      canDeposit: boolean;
      canWithdraw: boolean;
      depositMinAmount?: string;
      withdrawMinAmount?: string;
      withdrawMaxAmount?: string;
    }
  >;
}

export interface TickerData {
  ticker_id: string;
  base_currency: string;
  quote_currency: string;
  last_price: string;
  base_volume: string;
  quote_volume: string;
  isFrozen: string;
  change: string;
  ask: string;
  bid: string;
  high: string;
  low: string;
  volume: string;
  deal: string;
  at: number;
}

export interface OrderbookDepth {
  timestamp: number;
  asks: Array<[string, string]>;
  bids: Array<[string, string]>;
}

export interface TradeRecord {
  tradeId: number;
  price: string;
  volume: string;
  time: number;
  type: string;
}

export interface KlineRecord {
  time: number;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  deal: string;
}

export interface FeeInfo {
  ticker: string;
  name: string;
  canDeposit: boolean;
  canWithdraw: boolean;
  deposit: {
    minFlex?: string;
    maxFlex?: string;
  };
  withdraw: {
    minFlex?: string;
    maxFlex?: string;
    minFee?: string;
    maxFee?: string;
  };
  providers?: Array<{
    name: string;
    type: string;
    minDeposit?: string;
    maxDeposit?: string;
    depositFee?: string;
    withdrawMinFee?: string;
    withdrawMaxFee?: string;
  }>;
}

export interface FundingRecord {
  market: string;
  time: number;
  fundingRate: string;
}

export interface MiningPoolData {
  hashrate: string;
  hashrateUnit: string;
  workers: number;
  lastUpdate: number;
}

export interface MarketActivityData {
  [market: string]: {
    lastPrice: string;
    quoteVolume: string;
    baseVolume: string;
    change24h: string;
    high24h: string;
    low24h: string;
  };
}
