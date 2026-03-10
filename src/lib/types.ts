export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface PublicConfig {
  apiUrl: string;
}

export interface AuthConfig extends PublicConfig {
  apiKey: string;
  apiSecret: string;
}

export type ApiRequestBody = object;
export type ApiResponse = JsonValue | Record<string, unknown>;

export interface WhitebitSignedPayload extends ApiRequestBody {
  request: string;
  nonce: number;
  nonceWindow: boolean;
}
