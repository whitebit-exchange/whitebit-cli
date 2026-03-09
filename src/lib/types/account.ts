// Account & Wallet API Types

// Balance types
export interface MainBalanceParams {
  ticker?: string;
}

export interface BalanceEntry {
  main_balance: string;
  [key: string]: unknown;
}

export type MainBalanceResponse = Record<string, BalanceEntry>;

export interface OverviewResponse {
  [ticker: string]: {
    main_balance: string;
    trade_balance: string;
    [key: string]: unknown;
  };
}

export interface BalanceResponse {
  [ticker: string]: {
    available: string;
    freeze: string;
  };
}

export interface FeeResponse {
  [market: string]: {
    makerFee: string;
    takerFee: string;
  };
}

// Address types
export interface CryptoDepositAddressParams {
  ticker: string;
  network?: string;
}

export interface FiatDepositAddressParams {
  ticker: string;
  provider: string;
  amount?: string;
  uniqueId?: string;
}

export interface CreateAddressParams {
  ticker: string;
  network?: string;
}

export interface DepositAddressResponse {
  account: {
    address: string;
    memo?: string;
  };
  required?: {
    [key: string]: string;
  };
}

export interface FiatDepositAddressResponse {
  url: string;
  [key: string]: unknown;
}

// Withdrawal types
export interface WithdrawCryptoParams {
  ticker: string;
  amount: string;
  address: string;
  network?: string;
  memo?: string;
  uniqueId?: string;
}

export interface WithdrawCryptoWithAmountParams {
  ticker: string;
  amount: string;
  address: string;
  network?: string;
  uniqueId?: string;
}

export interface WithdrawFiatParams {
  ticker: string;
  amount: string;
  provider: string;
  account?: string;
  [key: string]: unknown;
}

export interface DepositRefundParams {
  id: number;
}

export interface WithdrawHistoryParams {
  limit?: number;
  offset?: number;
  transactionMethod?: number;
}

export interface WithdrawResponse {
  [key: string]: unknown;
}

export interface WithdrawHistoryResponse {
  limit: number;
  offset: number;
  records: Array<{
    [key: string]: unknown;
  }>;
  total: number;
}

// Transfer types
export interface TransferHistoryParams {
  limit?: number;
  offset?: number;
  transactionMethod?: number;
}

export interface TransferParams {
  ticker: string;
  amount: string;
  from: string;
  to: string;
}

export interface TransferResponse {
  [key: string]: unknown;
}

export interface TransferHistoryResponse {
  limit: number;
  offset: number;
  records: Array<{
    [key: string]: unknown;
  }>;
  total: number;
}

// Code / Voucher types
export interface CreateCodeParams {
  ticker: string;
  amount: string;
  passphrase?: string;
  description?: string;
}

export interface ApplyCodeParams {
  code: string;
  passphrase?: string;
}

export interface CodesHistoryParams {
  limit?: number;
  offset?: number;
}

export interface MyCodesParams {
  limit?: number;
  offset?: number;
}

export interface CodeResponse {
  code: string;
  [key: string]: unknown;
}

export interface CodesHistoryResponse {
  limit: number;
  offset: number;
  records: Array<{
    [key: string]: unknown;
  }>;
  total: number;
}

// Investment types (Fixed)
export interface InvestmentPlan {
  id: string;
  ticker: string;
  [key: string]: unknown;
}

export interface InvestParams {
  planId: string;
  amount: string;
}

export interface InvestmentsHistoryParams {
  limit?: number;
  offset?: number;
}

export interface CloseInvestmentParams {
  id: number;
}

export interface InvestmentResponse {
  [key: string]: unknown;
}

export interface InvestmentsHistoryResponse {
  limit: number;
  offset: number;
  records: Array<{
    [key: string]: unknown;
  }>;
  total: number;
}

// Flexible Investment types
export interface FlexibleInvestmentPlan {
  id: string;
  ticker: string;
  [key: string]: unknown;
}

export interface FlexInvestParams {
  planId: string;
  amount: string;
}

export interface FlexInvestment {
  id: number;
  [key: string]: unknown;
}

export interface FlexInvestmentHistoryParams {
  limit?: number;
  offset?: number;
}

export interface FlexPaymentHistoryParams {
  limit?: number;
  offset?: number;
}

export interface FlexWithdrawParams {
  id: number;
  amount: string;
}

export interface FlexCloseParams {
  id: number;
}

export interface FlexAutoReinvestParams {
  id: number;
  enabled: boolean;
}

export interface FlexInvestmentHistoryResponse {
  limit: number;
  offset: number;
  records: Array<{
    [key: string]: unknown;
  }>;
  total: number;
}

// Misc types
export interface RewardsResponse {
  [key: string]: unknown;
}

export interface MiningHashrateResponse {
  [key: string]: unknown;
}

export interface InterestPaymentsHistoryParams {
  limit?: number;
  offset?: number;
}

export interface InterestPaymentsHistoryResponse {
  limit: number;
  offset: number;
  records: Array<{
    [key: string]: unknown;
  }>;
  total: number;
}

export interface CreditLinesResponse {
  [key: string]: unknown;
}

export interface IssueCardTokenParams {
  [key: string]: unknown;
}

export interface CardTokenResponse {
  token: string;
  [key: string]: unknown;
}

export interface JwtTokenResponse {
  token: string;
  [key: string]: unknown;
}

export interface WebsocketProfileTokenResponse {
  token: string;
  [key: string]: unknown;
}
