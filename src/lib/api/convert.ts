import type { HttpClient } from '../http';
import type {
  ConvertConfirmParams,
  ConvertConfirmResponse,
  ConvertEstimate,
  ConvertEstimateParams,
  ConvertHistoryParams,
  ConvertHistoryResponse,
} from '../types/convert';

export class ConvertApi {
  constructor(private readonly httpClient: HttpClient) {}

  async estimate(params: ConvertEstimateParams): Promise<ConvertEstimate> {
    const response = await this.httpClient.post<ConvertEstimate>(
      '/api/v4/convert/estimate',
      params as unknown as Record<string, unknown>,
      {
        category: 'convert',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to estimate conversion');
    }

    return response.data;
  }

  async confirm(params: ConvertConfirmParams): Promise<ConvertConfirmResponse> {
    const response = await this.httpClient.post<ConvertConfirmResponse>(
      '/api/v4/convert/confirm',
      params as unknown as Record<string, unknown>,
      {
        category: 'convert',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to confirm conversion');
    }

    return response.data;
  }

  async history(params: ConvertHistoryParams = {}): Promise<ConvertHistoryResponse> {
    const response = await this.httpClient.post<ConvertHistoryResponse>(
      '/api/v4/convert/history',
      params as unknown as Record<string, unknown>,
      {
        category: 'convert',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch conversion history');
    }

    return response.data;
  }
}
