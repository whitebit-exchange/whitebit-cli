import { describe, expect, test } from 'bun:test';

import { SubAccountApi } from '../../../src/lib/api/sub-account';
import type { HttpClient } from '../../../src/lib/http';
import type {
  SubAccount,
  SubAccountApiKey,
  SubAccountBalance,
  SubAccountIpAddress,
  SubAccountTransfer,
} from '../../../src/lib/types/sub-account';

const createMockHttpClient = (mockResponse: unknown): HttpClient =>
  ({
    post: async () => ({
      success: true,
      data: mockResponse,
    }),
  }) as unknown as HttpClient;

const createMockHttpClientWithError = (errorMessage: string): HttpClient =>
  ({
    post: async () => ({
      success: false,
      error: { message: errorMessage },
    }),
  }) as unknown as HttpClient;

describe('SubAccountApi', () => {
  let api: SubAccountApi;

  describe('list', () => {
    test('returns list of sub-accounts', async () => {
      const mockData: SubAccount[] = [
        { id: 'sub-1', alias: 'Trading Bot', status: 'active' },
        { id: 'sub-2', alias: 'Savings', status: 'active' },
      ];
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.list();

      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
      expect(result[0]!.alias).toBe('Trading Bot');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Failed to fetch');
      api = new SubAccountApi(httpClient);

      await expect(api.list()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('create', () => {
    test('creates a new sub-account', async () => {
      const mockData: SubAccount = { id: 'sub-1', alias: 'New Bot', status: 'active' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.create({ alias: 'New Bot' });

      expect(result).toEqual(mockData);
      expect(result.alias).toBe('New Bot');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Alias already exists');
      api = new SubAccountApi(httpClient);

      await expect(api.create({ alias: 'Duplicate' })).rejects.toThrow('Alias already exists');
    });
  });

  describe('edit', () => {
    test('edits a sub-account', async () => {
      const mockData: SubAccount = { id: 'sub-1', alias: 'Updated Bot', status: 'active' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.edit({ id: 'sub-1', alias: 'Updated Bot' });

      expect(result).toEqual(mockData);
      expect(result.alias).toBe('Updated Bot');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Sub-account not found');
      api = new SubAccountApi(httpClient);

      await expect(api.edit({ id: 'invalid', alias: 'Test' })).rejects.toThrow(
        'Sub-account not found',
      );
    });
  });

  describe('delete', () => {
    test('deletes a sub-account', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.delete({ id: 'sub-1' });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Sub-account has balance');
      api = new SubAccountApi(httpClient);

      await expect(api.delete({ id: 'sub-1' })).rejects.toThrow('Sub-account has balance');
    });
  });

  describe('block', () => {
    test('blocks a sub-account', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.block({ id: 'sub-1' });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Sub-account not found');
      api = new SubAccountApi(httpClient);

      await expect(api.block({ id: 'invalid' })).rejects.toThrow('Sub-account not found');
    });
  });

  describe('unblock', () => {
    test('unblocks a sub-account', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.unblock({ id: 'sub-1' });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Sub-account not found');
      api = new SubAccountApi(httpClient);

      await expect(api.unblock({ id: 'invalid' })).rejects.toThrow('Sub-account not found');
    });
  });

  describe('balance', () => {
    test('returns sub-account balance', async () => {
      const mockData: SubAccountBalance = {
        BTC: { available: '1.5', freeze: '0.1' },
        ETH: { available: '10.0', freeze: '0.0' },
      };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.balance({ id: 'sub-1' });

      expect(result).toEqual(mockData);
      expect(result['BTC']!.available).toBe('1.5');
      expect(result['ETH']!.available).toBe('10.0');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Sub-account not found');
      api = new SubAccountApi(httpClient);

      await expect(api.balance({ id: 'invalid' })).rejects.toThrow('Sub-account not found');
    });
  });

  describe('transfer', () => {
    test('transfers funds to sub-account', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.transfer({
        toId: 'sub-1',
        ticker: 'BTC',
        amount: '0.5',
      });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('transfers funds from sub-account', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.transfer({
        fromId: 'sub-1',
        ticker: 'ETH',
        amount: '1.0',
      });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Insufficient balance');
      api = new SubAccountApi(httpClient);

      await expect(
        api.transfer({
          fromId: 'sub-1',
          ticker: 'BTC',
          amount: '100',
        }),
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('transferHistory', () => {
    test('returns transfer history', async () => {
      const mockData: SubAccountTransfer[] = [
        {
          id: 'tx-1',
          fromId: 'main',
          toId: 'sub-1',
          ticker: 'BTC',
          amount: '0.5',
          timestamp: 1641081600,
        },
        {
          id: 'tx-2',
          fromId: 'sub-1',
          toId: 'main',
          ticker: 'ETH',
          amount: '1.0',
          timestamp: 1641085200,
        },
      ];
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.transferHistory({ id: 'sub-1' });

      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
      expect(result[0]!.ticker).toBe('BTC');
    });

    test('returns transfer history with pagination', async () => {
      const mockData: SubAccountTransfer[] = [
        {
          id: 'tx-3',
          fromId: 'sub-2',
          toId: 'main',
          ticker: 'USDT',
          amount: '100.0',
          timestamp: 1641088800,
        },
      ];
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.transferHistory({ id: 'sub-1', limit: 50, offset: 0 });

      expect(result).toEqual(mockData);
      expect(result.length).toBe(1);
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Failed to fetch');
      api = new SubAccountApi(httpClient);

      await expect(api.transferHistory({ id: 'sub-1' })).rejects.toThrow('Failed to fetch');
    });
  });

  describe('apiKeyList', () => {
    test('returns list of API keys', async () => {
      const mockData: SubAccountApiKey[] = [
        {
          id: 'key-1',
          label: 'Trading Bot',
          permissions: ['trade', 'info'],
          createdAt: 1641081600,
        },
        {
          id: 'key-2',
          label: 'Read Only',
          permissions: ['info'],
          createdAt: 1641085200,
        },
      ];
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.apiKeyList({ subAccountId: 'sub-1' });

      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
      expect(result[0]!.label).toBe('Trading Bot');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Sub-account not found');
      api = new SubAccountApi(httpClient);

      await expect(api.apiKeyList({ subAccountId: 'invalid' })).rejects.toThrow(
        'Sub-account not found',
      );
    });
  });

  describe('apiKeyCreate', () => {
    test('creates a new API key', async () => {
      const mockData: SubAccountApiKey = {
        id: 'key-1',
        label: 'New Key',
        permissions: ['trade', 'withdraw'],
        createdAt: 1641081600,
      };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.apiKeyCreate({
        subAccountId: 'sub-1',
        label: 'New Key',
        permissions: ['trade', 'withdraw'],
      });

      expect(result).toEqual(mockData);
      expect(result.label).toBe('New Key');
      expect(result.permissions).toContain('trade');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Invalid permissions');
      api = new SubAccountApi(httpClient);

      await expect(
        api.apiKeyCreate({
          subAccountId: 'sub-1',
          label: 'Test',
          permissions: ['invalid'],
        }),
      ).rejects.toThrow('Invalid permissions');
    });
  });

  describe('apiKeyEdit', () => {
    test('edits an API key', async () => {
      const mockData: SubAccountApiKey = {
        id: 'key-1',
        label: 'Updated Key',
        permissions: ['info'],
        createdAt: 1641081600,
      };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.apiKeyEdit({
        subAccountId: 'sub-1',
        apiKeyId: 'key-1',
        label: 'Updated Key',
      });

      expect(result).toEqual(mockData);
      expect(result.label).toBe('Updated Key');
    });

    test('edits API key permissions', async () => {
      const mockData: SubAccountApiKey = {
        id: 'key-1',
        label: 'Key',
        permissions: ['trade', 'info'],
        createdAt: 1641081600,
      };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.apiKeyEdit({
        subAccountId: 'sub-1',
        apiKeyId: 'key-1',
        permissions: ['trade', 'info'],
      });

      expect(result).toEqual(mockData);
      expect(result.permissions).toContain('trade');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('API key not found');
      api = new SubAccountApi(httpClient);

      await expect(
        api.apiKeyEdit({
          subAccountId: 'sub-1',
          apiKeyId: 'invalid',
          label: 'Test',
        }),
      ).rejects.toThrow('API key not found');
    });
  });

  describe('apiKeyReset', () => {
    test('resets an API key', async () => {
      const mockData: SubAccountApiKey = {
        id: 'key-1',
        label: 'Reset Key',
        permissions: ['trade'],
        createdAt: 1641081600,
      };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.apiKeyReset({
        subAccountId: 'sub-1',
        apiKeyId: 'key-1',
      });

      expect(result).toEqual(mockData);
      expect(result.id).toBe('key-1');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('API key not found');
      api = new SubAccountApi(httpClient);

      await expect(
        api.apiKeyReset({
          subAccountId: 'sub-1',
          apiKeyId: 'invalid',
        }),
      ).rejects.toThrow('API key not found');
    });
  });

  describe('apiKeyDelete', () => {
    test('deletes an API key', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.apiKeyDelete({
        subAccountId: 'sub-1',
        apiKeyId: 'key-1',
      });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('API key not found');
      api = new SubAccountApi(httpClient);

      await expect(
        api.apiKeyDelete({
          subAccountId: 'sub-1',
          apiKeyId: 'invalid',
        }),
      ).rejects.toThrow('API key not found');
    });
  });

  describe('ipAddressList', () => {
    test('returns list of IP addresses', async () => {
      const mockData: SubAccountIpAddress[] = [
        { ip: '192.168.1.1', createdAt: 1641081600 },
        { ip: '10.0.0.1', createdAt: 1641085200 },
      ];
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.ipAddressList({
        subAccountId: 'sub-1',
        apiKeyId: 'key-1',
      });

      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
      expect(result[0]!.ip).toBe('192.168.1.1');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('API key not found');
      api = new SubAccountApi(httpClient);

      await expect(
        api.ipAddressList({
          subAccountId: 'sub-1',
          apiKeyId: 'invalid',
        }),
      ).rejects.toThrow('API key not found');
    });
  });

  describe('ipAddressAdd', () => {
    test('adds an IP address', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.ipAddressAdd({
        subAccountId: 'sub-1',
        apiKeyId: 'key-1',
        ip: '203.0.113.5',
      });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('Invalid IP address');
      api = new SubAccountApi(httpClient);

      await expect(
        api.ipAddressAdd({
          subAccountId: 'sub-1',
          apiKeyId: 'key-1',
          ip: 'invalid',
        }),
      ).rejects.toThrow('Invalid IP address');
    });
  });

  describe('ipAddressDelete', () => {
    test('deletes an IP address', async () => {
      const mockData = { result: 'success' };
      const httpClient = createMockHttpClient(mockData);
      api = new SubAccountApi(httpClient);

      const result = await api.ipAddressDelete({
        subAccountId: 'sub-1',
        apiKeyId: 'key-1',
        ip: '192.168.1.1',
      });

      expect(result).toEqual(mockData);
      expect(result.result).toBe('success');
    });

    test('handles error response', async () => {
      const httpClient = createMockHttpClientWithError('IP address not found');
      api = new SubAccountApi(httpClient);

      await expect(
        api.ipAddressDelete({
          subAccountId: 'sub-1',
          apiKeyId: 'key-1',
          ip: '192.168.1.1',
        }),
      ).rejects.toThrow('IP address not found');
    });
  });
});
