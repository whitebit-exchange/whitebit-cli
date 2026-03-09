import { createAuthHeadersFromPayload, createSignedPayload } from './auth';
import { getGlobalConfigOverrides, loadConfig, maskSecret } from './config';
import { type RateLimitCategory, RateLimiter } from './rate-limiter';
import { withRetry } from './retry';
import type { ApiRequestBody, ApiResponse, AuthConfig, PublicConfig } from './types';
import { DEFAULT_USER_AGENT } from './version';

export { DEFAULT_USER_AGENT };

export interface ApiError {
  status?: number;
  code?: number | string;
  message: string;
  params?: unknown;
  errors?: Record<string, string[]>;
  raw?: unknown;
}

export interface NormalizedApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface HttpClientOptions {
  apiUrl: string;
  apiKey?: string;
  apiSecret?: string;
  fetch?: typeof fetch;
  rateLimiter?: {
    acquire: (category: RateLimitCategory) => Promise<void>;
  };
  retryMaxRetries?: number;
  retrySleep?: (ms: number) => Promise<void>;
  userAgent?: string;
  runtimeLogging?: boolean;
}

export interface HttpRequestOptions {
  category?: RateLimitCategory;
  maxRetries?: number;
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

interface InternalRequestOptions {
  method: 'GET' | 'POST';
  endpointPath: string;
  params?: QueryParams;
  body?: ApiRequestBody;
  privateRequest: boolean;
  category: RateLimitCategory;
  maxRetries?: number;
}

interface PublicErrorPayload {
  success: false;
  message: string;
  params?: unknown;
}

interface PrivateErrorPayload {
  code: number | string;
  message: string;
  errors?: Record<string, string[]>;
}

class HttpResponseError extends Error {
  readonly status: number;

  readonly responseBody: unknown;

  constructor(status: number, statusText: string, responseBody: unknown) {
    super(`WhiteBIT request failed (${status} ${statusText})`);
    this.name = 'HttpResponseError';
    this.status = status;
    this.responseBody = responseBody;
  }
}

const normalizeApiUrl = (apiUrl: string): string => apiUrl.replace(/\/+$/, '');

const resolveUrl = (apiUrl: string, endpointPath: string, params?: QueryParams): string => {
  const url = new URL(endpointPath, `${normalizeApiUrl(apiUrl)}/`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined) {
      continue;
    }

    url.searchParams.set(key, `${value}`);
  }

  return url.toString();
};

const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizePrivateErrors = (errors: unknown): Record<string, string[]> | undefined => {
  if (!isRecord(errors)) {
    return undefined;
  }

  const normalizedErrors: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(errors)) {
    if (!Array.isArray(value)) {
      continue;
    }

    const messages = value.filter((item): item is string => typeof item === 'string');
    if (messages.length > 0) {
      normalizedErrors[key] = messages;
    }
  }

  return Object.keys(normalizedErrors).length > 0 ? normalizedErrors : undefined;
};

const isPublicErrorPayload = (value: unknown): value is PublicErrorPayload => {
  if (!isRecord(value)) {
    return false;
  }

  return value.success === false && typeof value.message === 'string';
};

const isPrivateErrorPayload = (value: unknown): value is PrivateErrorPayload => {
  if (!isRecord(value)) {
    return false;
  }

  const code = value.code;
  if (typeof code !== 'number' && typeof code !== 'string') {
    return false;
  }

  return typeof value.message === 'string';
};

const normalizeError = (
  body: unknown,
  status?: number,
  fallbackMessage = 'WhiteBIT request failed',
): ApiError => {
  if (isPublicErrorPayload(body)) {
    return {
      status,
      message: body.message,
      params: body.params,
      raw: body,
    };
  }

  if (isPrivateErrorPayload(body)) {
    return {
      status,
      code: body.code,
      message: body.message,
      errors: normalizePrivateErrors(body.errors),
      raw: body,
    };
  }

  if (typeof body === 'string' && body.length > 0) {
    return {
      status,
      message: body,
      raw: body,
    };
  }

  if (isRecord(body) && typeof body.message === 'string') {
    return {
      status,
      message: body.message,
      raw: body,
    };
  }

  return {
    status,
    message: fallbackMessage,
    raw: body,
  };
};

const stringifyError = (error?: ApiError): string => {
  if (!error) {
    return 'WhiteBIT request failed';
  }

  if (error.code === undefined) {
    return error.message;
  }

  return `${error.message} (code: ${error.code})`;
};

interface RequestPreview {
  method: 'GET' | 'POST';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

const shouldMaskHeader = (headerName: string): boolean => {
  const normalized = headerName.toLowerCase();
  return (
    normalized.includes('apikey') ||
    normalized.includes('secret') ||
    normalized.includes('signature') ||
    normalized.includes('payload') ||
    normalized.includes('authorization')
  );
};

const renderPreview = (request: RequestPreview): string => {
  const lines: string[] = [];
  lines.push(`Method: ${request.method}`);
  lines.push(`URL: ${request.url}`);
  lines.push('Headers:');

  const sortedHeaders = Object.keys(request.headers).sort((left, right) =>
    left.localeCompare(right),
  );
  for (const headerName of sortedHeaders) {
    const rawValue = request.headers[headerName] ?? '';
    const renderedValue = shouldMaskHeader(headerName) ? maskSecret(rawValue) : rawValue;
    lines.push(`  ${headerName}: ${renderedValue}`);
  }

  if (typeof request.body !== 'undefined') {
    lines.push(`Body: ${request.body}`);
  }

  return lines.join('\n');
};

const writeDryRunPreview = (request: RequestPreview): void => {
  process.stderr.write(`[dry-run] Request preview\n${renderPreview(request)}\n`);
};

const writeVerboseRequest = (request: RequestPreview): void => {
  process.stderr.write(`[verbose] Outgoing request\n${renderPreview(request)}\n`);
};

const writeVerboseResponse = (response: NormalizedApiResponse<unknown>): void => {
  process.stderr.write(`[verbose] Response success: ${response.success}\n`);
  process.stderr.write(`${JSON.stringify(response, null, 2)}\n`);
};

const resolveRuntimeFlags = (): { verbose: boolean; dryRun: boolean } => {
  const overrides = getGlobalConfigOverrides();
  return {
    verbose: overrides.verbose === true,
    dryRun: overrides.dryRun === true,
  };
};

export class HttpClient {
  private readonly apiUrl: string;

  private readonly apiKey?: string;

  private readonly apiSecret?: string;

  private readonly fetchFn: typeof fetch;

  private readonly rateLimiter: {
    acquire: (category: RateLimitCategory) => Promise<void>;
  };

  private readonly retryMaxRetries: number;

  private readonly retrySleep?: (ms: number) => Promise<void>;

  private readonly userAgent: string;

  private readonly runtimeLogging: boolean;

  constructor(options: HttpClientOptions) {
    this.apiUrl = normalizeApiUrl(options.apiUrl);
    this.apiKey = options.apiKey;
    this.apiSecret = options.apiSecret;
    this.fetchFn = options.fetch ?? fetch;
    this.rateLimiter = options.rateLimiter ?? new RateLimiter();
    this.retryMaxRetries = options.retryMaxRetries ?? 3;
    this.retrySleep = options.retrySleep;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.runtimeLogging = options.runtimeLogging ?? true;
  }

  get<T = ApiResponse>(
    endpointPath: string,
    params?: QueryParams,
    options: HttpRequestOptions = {},
  ): Promise<NormalizedApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      endpointPath,
      params,
      privateRequest: false,
      category: options.category ?? 'public',
      maxRetries: options.maxRetries,
    });
  }

  post<T = ApiResponse>(
    endpointPath: string,
    body: ApiRequestBody = {},
    options: HttpRequestOptions = {},
  ): Promise<NormalizedApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      endpointPath,
      body,
      privateRequest: true,
      category: options.category ?? 'account',
      maxRetries: options.maxRetries,
    });
  }

  private async request<T>(options: InternalRequestOptions): Promise<NormalizedApiResponse<T>> {
    const url = resolveUrl(this.apiUrl, options.endpointPath, options.params);
    const runtimeFlags = this.runtimeLogging
      ? resolveRuntimeFlags()
      : {
          verbose: false,
          dryRun: false,
        };

    if (runtimeFlags.dryRun) {
      const requestData = this.buildRequestData(options);
      writeDryRunPreview({
        method: options.method,
        url,
        headers: requestData.headers,
        body: requestData.body,
      });

      return {
        success: true,
        data: {
          dry_run: true,
          method: options.method,
          url,
        } as T,
      };
    }

    try {
      const responseBody = await withRetry(
        async () => {
          await this.rateLimiter.acquire(options.category);
          const requestData = this.buildRequestData(options);

          if (runtimeFlags.verbose) {
            writeVerboseRequest({
              method: options.method,
              url,
              headers: requestData.headers,
              body: requestData.body,
            });
          }

          const response = await this.fetchFn(url, {
            method: options.method,
            headers: requestData.headers,
            body: requestData.body,
          });

          const parsedResponse = await parseResponse(response);
          if (!response.ok) {
            throw new HttpResponseError(response.status, response.statusText, parsedResponse);
          }

          return parsedResponse;
        },
        options.maxRetries ?? this.retryMaxRetries,
        {
          sleep: this.retrySleep,
        },
      );

      if (isPublicErrorPayload(responseBody) || isPrivateErrorPayload(responseBody)) {
        const result = {
          success: false,
          error: normalizeError(responseBody),
        };

        if (runtimeFlags.verbose) {
          writeVerboseResponse(result);
        }

        return result;
      }

      const result = {
        success: true,
        data: responseBody as T,
      };

      if (runtimeFlags.verbose) {
        writeVerboseResponse(result as NormalizedApiResponse<unknown>);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpResponseError) {
        const result = {
          success: false,
          error: normalizeError(error.responseBody, error.status, error.message),
        };

        if (runtimeFlags.verbose) {
          writeVerboseResponse(result);
        }

        return result;
      }

      if (error instanceof Error) {
        const result = {
          success: false,
          error: {
            message: error.message,
          },
        };

        if (runtimeFlags.verbose) {
          writeVerboseResponse(result);
        }

        return result;
      }

      const result = {
        success: false,
        error: {
          message: 'Unknown request failure',
        },
      };

      if (runtimeFlags.verbose) {
        writeVerboseResponse(result);
      }

      return result;
    }
  }

  private buildRequestData(options: InternalRequestOptions): {
    headers: Record<string, string>;
    body?: string;
  } {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': this.userAgent,
    };

    if (options.privateRequest) {
      if (!this.apiKey || !this.apiSecret) {
        throw new Error('API credentials are required for private requests');
      }

      const signedPayload = createSignedPayload(options.endpointPath, options.body ?? {});
      const authHeaders = createAuthHeadersFromPayload(this.apiKey, this.apiSecret, signedPayload);

      headers['Content-Type'] = 'application/json';
      Object.assign(headers, authHeaders);

      return {
        headers,
        body: JSON.stringify(signedPayload),
      };
    }

    return {
      headers,
    };
  }
}

export const publicGet = async (
  endpointPath: string,
  config: PublicConfig,
): Promise<ApiResponse> => {
  const runtimeConfig = loadConfig();
  const request: RequestPreview = {
    method: 'GET',
    url: resolveUrl(config.apiUrl, endpointPath),
    headers: {
      Accept: 'application/json',
      'User-Agent': DEFAULT_USER_AGENT,
    },
  };

  if (runtimeConfig.dryRun) {
    writeDryRunPreview(request);
    return {
      dry_run: true,
      method: request.method,
      url: request.url,
    } as ApiResponse;
  }

  if (runtimeConfig.verbose) {
    writeVerboseRequest(request);
  }

  const client = new HttpClient({
    apiUrl: config.apiUrl,
    retryMaxRetries: runtimeConfig.retry ? undefined : 0,
    userAgent: DEFAULT_USER_AGENT,
    runtimeLogging: false,
  });

  const response = await client.get<ApiResponse>(endpointPath);
  if (runtimeConfig.verbose) {
    writeVerboseResponse(response);
  }

  if (!response.success) {
    throw new Error(stringifyError(response.error));
  }

  return response.data as ApiResponse;
};

export const authenticatedPost = async (
  endpointPath: string,
  body: ApiRequestBody,
  config: AuthConfig,
): Promise<ApiResponse> => {
  const runtimeConfig = loadConfig();
  const signedPayload = createSignedPayload(endpointPath, body);
  const requestBody = JSON.stringify(signedPayload);
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': DEFAULT_USER_AGENT,
    ...createAuthHeadersFromPayload(config.apiKey, config.apiSecret, signedPayload),
  };
  const request: RequestPreview = {
    method: 'POST',
    url: resolveUrl(config.apiUrl, endpointPath),
    headers: requestHeaders,
    body: requestBody,
  };

  if (runtimeConfig.dryRun) {
    writeDryRunPreview(request);
    return {
      dry_run: true,
      method: request.method,
      url: request.url,
    } as ApiResponse;
  }

  if (runtimeConfig.verbose) {
    writeVerboseRequest(request);
  }

  const client = new HttpClient({
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    retryMaxRetries: runtimeConfig.retry ? undefined : 0,
    userAgent: DEFAULT_USER_AGENT,
    runtimeLogging: false,
  });

  const response = await client.post<ApiResponse>(endpointPath, body);
  if (runtimeConfig.verbose) {
    writeVerboseResponse(response);
  }

  if (!response.success) {
    throw new Error(stringifyError(response.error));
  }

  return response.data as ApiResponse;
};
