import { WhitebitApiClient } from 'whitebit-typescript-sdk';
import { createHmacFetch } from 'whitebit-typescript-sdk/auth';

import { loadAuthConfig, loadPublicConfig } from './config';

export const createClient = (): WhitebitApiClient => {
  const cfg = loadAuthConfig();
  return new WhitebitApiClient({
    apiKey: cfg.apiKey,
    baseUrl: cfg.apiUrl,
    fetch: createHmacFetch(cfg.apiSecret),
    txcPayload: '',
    txcSignature: '',
  });
};

// The generated request types still require `request`/`nonce`, but createHmacFetch
// fills them in automatically when absent — omit them and cast to satisfy the type.
export const withAuth = <T extends Record<string, unknown>>(body: T) =>
  body as T & { request: string; nonce: number };

export const createPublicClient = (): WhitebitApiClient => {
  const cfg = loadPublicConfig();
  return new WhitebitApiClient({
    apiKey: '',
    baseUrl: cfg.apiUrl,
    txcPayload: '',
    txcSignature: '',
  });
};
