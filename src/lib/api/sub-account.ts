import type { HttpClient } from '../http';
import type {
  BlockSubAccountParams,
  CreateSubAccountParams,
  DeleteSubAccountParams,
  EditSubAccountParams,
  SubAccount,
  SubAccountApiKey,
  SubAccountApiKeyCreateParams,
  SubAccountApiKeyDeleteParams,
  SubAccountApiKeyEditParams,
  SubAccountApiKeyListParams,
  SubAccountApiKeyResetParams,
  SubAccountBalance,
  SubAccountBalanceParams,
  SubAccountIpAddress,
  SubAccountIpAddressAddParams,
  SubAccountIpAddressDeleteParams,
  SubAccountIpAddressListParams,
  SubAccountTransfer,
  SubAccountTransferHistoryParams,
  SubAccountTransferParams,
  UnblockSubAccountParams,
} from '../types/sub-account';

export class SubAccountApi {
  constructor(private readonly httpClient: HttpClient) {}

  async list(): Promise<SubAccount[]> {
    const response = await this.httpClient.post<SubAccount[]>(
      '/api/v4/sub-account/list',
      {},
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch sub-account list');
    }

    return response.data;
  }

  async create(params: CreateSubAccountParams): Promise<SubAccount> {
    const response = await this.httpClient.post<SubAccount>('/api/v4/sub-account/create', params, {
      category: 'sub-account',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create sub-account');
    }

    return response.data;
  }

  async edit(params: EditSubAccountParams): Promise<SubAccount> {
    const response = await this.httpClient.post<SubAccount>('/api/v4/sub-account/edit', params, {
      category: 'sub-account',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to edit sub-account');
    }

    return response.data;
  }

  async delete(params: DeleteSubAccountParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/sub-account/delete',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to delete sub-account');
    }

    return response.data;
  }

  async block(params: BlockSubAccountParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/sub-account/block',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to block sub-account');
    }

    return response.data;
  }

  async unblock(params: UnblockSubAccountParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/sub-account/unblock',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to unblock sub-account');
    }

    return response.data;
  }

  async balance(params: SubAccountBalanceParams): Promise<SubAccountBalance> {
    const response = await this.httpClient.post<SubAccountBalance>(
      '/api/v4/sub-account/balance',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch sub-account balance');
    }

    return response.data;
  }

  async transfer(params: SubAccountTransferParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/sub-account/transfer',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to transfer funds');
    }

    return response.data;
  }

  async transferHistory(params: SubAccountTransferHistoryParams): Promise<SubAccountTransfer[]> {
    const response = await this.httpClient.post<SubAccountTransfer[]>(
      '/api/v4/sub-account/transfer/history',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch transfer history');
    }

    return response.data;
  }

  async apiKeyList(params: SubAccountApiKeyListParams): Promise<SubAccountApiKey[]> {
    const response = await this.httpClient.post<SubAccountApiKey[]>(
      '/api/v4/sub-account/api-key/list',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch API key list');
    }

    return response.data;
  }

  async apiKeyCreate(params: SubAccountApiKeyCreateParams): Promise<SubAccountApiKey> {
    const response = await this.httpClient.post<SubAccountApiKey>(
      '/api/v4/sub-account/api-key/create',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create API key');
    }

    return response.data;
  }

  async apiKeyEdit(params: SubAccountApiKeyEditParams): Promise<SubAccountApiKey> {
    const response = await this.httpClient.post<SubAccountApiKey>(
      '/api/v4/sub-account/api-key/edit',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to edit API key');
    }

    return response.data;
  }

  async apiKeyReset(params: SubAccountApiKeyResetParams): Promise<SubAccountApiKey> {
    const response = await this.httpClient.post<SubAccountApiKey>(
      '/api/v4/sub-account/api-key/reset',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to reset API key');
    }

    return response.data;
  }

  async apiKeyDelete(params: SubAccountApiKeyDeleteParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/sub-account/api-key/delete',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to delete API key');
    }

    return response.data;
  }

  async ipAddressList(params: SubAccountIpAddressListParams): Promise<SubAccountIpAddress[]> {
    const response = await this.httpClient.post<SubAccountIpAddress[]>(
      '/api/v4/sub-account/api-key/ip/list',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch IP address list');
    }

    return response.data;
  }

  async ipAddressAdd(params: SubAccountIpAddressAddParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/sub-account/api-key/ip/add',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to add IP address');
    }

    return response.data;
  }

  async ipAddressDelete(params: SubAccountIpAddressDeleteParams): Promise<{ result: string }> {
    const response = await this.httpClient.post<{ result: string }>(
      '/api/v4/sub-account/api-key/ip/delete',
      params,
      {
        category: 'sub-account',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to delete IP address');
    }

    return response.data;
  }
}
