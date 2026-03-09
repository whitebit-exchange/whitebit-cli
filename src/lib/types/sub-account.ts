// Sub-Account API Types

// Sub-Account Management Types
export interface SubAccount {
  id: string;
  alias: string;
  email?: string;
  createdAt?: number;
  status?: string;
}

export interface CreateSubAccountParams extends Record<string, unknown> {
  alias: string;
}

export interface EditSubAccountParams extends Record<string, unknown> {
  id: string;
  alias: string;
}

export interface DeleteSubAccountParams extends Record<string, unknown> {
  id: string;
}

export interface BlockSubAccountParams extends Record<string, unknown> {
  id: string;
}

export interface UnblockSubAccountParams extends Record<string, unknown> {
  id: string;
}

// Balance & Transfer Types
export interface SubAccountBalanceParams extends Record<string, unknown> {
  id: string;
}

export interface SubAccountBalance {
  [ticker: string]: {
    available: string;
    freeze: string;
  };
}

export interface SubAccountTransferParams extends Record<string, unknown> {
  fromId?: string;
  toId?: string;
  ticker: string;
  amount: string;
}

export interface SubAccountTransferHistoryParams extends Record<string, unknown> {
  limit?: number;
  offset?: number;
}

export interface SubAccountTransfer {
  id: string;
  fromId?: string;
  toId?: string;
  ticker: string;
  amount: string;
  timestamp: number;
}

// API Key Management Types
export interface SubAccountApiKeyListParams extends Record<string, unknown> {
  subAccountId: string;
}

export interface SubAccountApiKey {
  id: string;
  label: string;
  permissions: string[];
  createdAt: number;
  lastUsedAt?: number;
}

export interface SubAccountApiKeyCreateParams extends Record<string, unknown> {
  subAccountId: string;
  label: string;
  permissions: string[];
}

export interface SubAccountApiKeyEditParams extends Record<string, unknown> {
  subAccountId: string;
  apiKeyId: string;
  label?: string;
  permissions?: string[];
}

export interface SubAccountApiKeyResetParams extends Record<string, unknown> {
  subAccountId: string;
  apiKeyId: string;
}

export interface SubAccountApiKeyDeleteParams extends Record<string, unknown> {
  subAccountId: string;
  apiKeyId: string;
}

// IP Address Management Types
export interface SubAccountIpAddressListParams extends Record<string, unknown> {
  subAccountId: string;
  apiKeyId: string;
}

export interface SubAccountIpAddress {
  ip: string;
  createdAt: number;
}

export interface SubAccountIpAddressAddParams extends Record<string, unknown> {
  subAccountId: string;
  apiKeyId: string;
  ip: string;
}

export interface SubAccountIpAddressDeleteParams extends Record<string, unknown> {
  subAccountId: string;
  apiKeyId: string;
  ip: string;
}
