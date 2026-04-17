import { createHmac } from 'node:crypto';

import { WhitebitApiClient } from 'whitebit-typescript-sdk';

import { loadAuthConfig, loadPublicConfig } from './config';

function makeSigningFetch(apiKey: string, apiSecret: string) {
  return async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    const endpointPath = new URL(url).pathname;

    let bodyObj: Record<string, unknown> = {};
    if (init?.body) {
      try {
        bodyObj = JSON.parse(init.body as string);
      } catch {
        // not JSON — leave as-is
      }
    }

    const signedBody = {
      ...bodyObj,
      request: endpointPath,
      nonce: Date.now(),
      nonceWindow: true,
    };

    const bodyJson = JSON.stringify(signedBody);
    const payloadBase64 = Buffer.from(bodyJson).toString('base64');
    const signature = createHmac('sha512', apiSecret).update(payloadBase64).digest('hex');

    const newInit: RequestInit = {
      ...init,
      body: bodyJson,
      headers: {
        ...(init?.headers as Record<string, string>),
        'X-TXC-APIKEY': apiKey,
        'X-TXC-PAYLOAD': payloadBase64,
        'X-TXC-SIGNATURE': signature,
      },
    };

    return fetch(input, newInit);
  };
}

export const createClient = (): WhitebitApiClient => {
  const cfg = loadAuthConfig();
  return new WhitebitApiClient({
    txcApikey: cfg.apiKey,
    token: cfg.apiSecret,
    baseUrl: cfg.apiUrl,
    fetch: makeSigningFetch(cfg.apiKey, cfg.apiSecret) as typeof fetch,
  });
};

export const authFields = () => ({
  request: '{{request}}',
  nonce: String(Date.now()),
});

export const createPublicClient = (): WhitebitApiClient => {
  const cfg = loadPublicConfig();
  return new WhitebitApiClient({
    txcApikey: '',
    token: '',
    baseUrl: cfg.apiUrl,
  });
};
