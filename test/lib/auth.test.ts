import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { createAuthHeaders } from '../../src/lib/auth';

const FIXED_NONCE = 1700000000000;
const API_KEY = 'test-key';
const API_SECRET = 'test-secret';
const ENDPOINT = '/api/v4/trade-balance';
const REQUEST_BODY = { ticker: 'BTC' };

const EXPECTED_PAYLOAD_BASE64 =
  'eyJyZXF1ZXN0IjoiL2FwaS92NC90cmFkZS1iYWxhbmNlIiwibm9uY2UiOjE3MDAwMDAwMDAwMDAsIm5vbmNlV2luZG93Ijp0cnVlLCJ0aWNrZXIiOiJCVEMifQ==';
const EXPECTED_SIGNATURE =
  '81d08e8576e565acb3da4ec9125fc4d87683c97a183a6034f4cf1cd2f2c2b70af2da3aaba2241afa785d5fb7ad6e25d8dbe7049608f409487a56067703df9b92';

let originalDateNow: typeof Date.now;

const setDateNow = (fn: typeof Date.now): void => {
  Object.defineProperty(Date, 'now', {
    value: fn,
    configurable: true,
    writable: true,
  });
};

const decodePayload = (payloadBase64: string): Record<string, unknown> => {
  const json = Buffer.from(payloadBase64, 'base64').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
};

describe('createAuthHeaders', () => {
  beforeEach(() => {
    originalDateNow = Date.now;
    setDateNow(() => FIXED_NONCE);
  });

  afterEach(() => {
    setDateNow(originalDateNow);
  });

  test('produces known payload and signature for fixed input', () => {
    const headers = createAuthHeaders(API_KEY, API_SECRET, ENDPOINT, REQUEST_BODY);

    expect(headers['X-TXC-APIKEY']).toBe(API_KEY);
    expect(headers['X-TXC-PAYLOAD']).toBe(EXPECTED_PAYLOAD_BASE64);
    expect(headers['X-TXC-SIGNATURE']).toBe(EXPECTED_SIGNATURE);
  });

  test('includes request field matching endpoint path', () => {
    const headers = createAuthHeaders(API_KEY, API_SECRET, ENDPOINT, REQUEST_BODY);
    const payload = decodePayload(headers['X-TXC-PAYLOAD']);

    expect(payload.request).toBe(ENDPOINT);
  });

  test('includes nonce as a number from Date.now', () => {
    const headers = createAuthHeaders(API_KEY, API_SECRET, ENDPOINT, REQUEST_BODY);
    const payload = decodePayload(headers['X-TXC-PAYLOAD']);

    expect(typeof payload.nonce).toBe('number');
    expect(payload.nonce).toBe(FIXED_NONCE);
  });

  test('includes nonceWindow set to true', () => {
    const headers = createAuthHeaders(API_KEY, API_SECRET, ENDPOINT, REQUEST_BODY);
    const payload = decodePayload(headers['X-TXC-PAYLOAD']);

    expect(payload.nonceWindow).toBe(true);
  });

  test('sets X-TXC-PAYLOAD as base64-encoded JSON', () => {
    const headers = createAuthHeaders(API_KEY, API_SECRET, ENDPOINT, REQUEST_BODY);

    expect(() => decodePayload(headers['X-TXC-PAYLOAD'])).not.toThrow();
  });

  test('sets X-TXC-SIGNATURE as hex-encoded HMAC-SHA512', () => {
    const headers = createAuthHeaders(API_KEY, API_SECRET, ENDPOINT, REQUEST_BODY);

    expect(headers['X-TXC-SIGNATURE']).toMatch(/^[a-f0-9]{128}$/);
  });
});
