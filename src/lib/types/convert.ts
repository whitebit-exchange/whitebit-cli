// WhiteBIT Convert API Types

export interface ConvertEstimateParams {
  from: string;
  to: string;
  amount: string;
  direction: 'from' | 'to';
}

export interface ConvertEstimate {
  id: string;
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  expiresAt: number;
}

export interface ConvertConfirmParams {
  estimateId: string;
}

export interface ConvertConfirmResponse {
  transactionId: string;
  fromAmount: string;
  toAmount: string;
  from: string;
  to: string;
  rate: string;
  timestamp: number;
  status: string;
}

export interface ConvertHistoryParams {
  limit?: number;
  offset?: number;
}

export interface ConvertHistoryItem {
  transactionId: string;
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  timestamp: number;
  status: string;
}

export interface ConvertHistoryResponse {
  records: ConvertHistoryItem[];
  total: number;
}
