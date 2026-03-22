import { createHmac } from 'node:crypto';

import type { ApiRequestBody, WhitebitSignedPayload } from './types';

export interface AuthHeaders {
  'X-TXC-APIKEY': string;
  'X-TXC-PAYLOAD': string;
  'X-TXC-SIGNATURE': string;
}

const encodePayload = (payload: WhitebitSignedPayload): string =>
  Buffer.from(JSON.stringify(payload)).toString('base64');

export const createAuthHeadersFromPayload = (
  apiKey: string,
  apiSecret: string,
  payload: WhitebitSignedPayload,
): AuthHeaders => {
  const payloadBase64 = encodePayload(payload);
  const signature = createHmac('sha512', apiSecret).update(payloadBase64).digest('hex');

  return {
    'X-TXC-APIKEY': apiKey,
    'X-TXC-PAYLOAD': payloadBase64,
    'X-TXC-SIGNATURE': signature,
  };
};

export const createSignedPayload = (
  endpointPath: string,
  body: ApiRequestBody = {},
): WhitebitSignedPayload => ({
  request: endpointPath,
  nonce: Date.now(),
  nonceWindow: true,
  ...body,
});

export const createAuthHeaders = (
  apiKey: string,
  apiSecret: string,
  endpointPath: string,
  body: ApiRequestBody = {},
): AuthHeaders => {
  const payload = createSignedPayload(endpointPath, body);
  return createAuthHeadersFromPayload(apiKey, apiSecret, payload);
};
