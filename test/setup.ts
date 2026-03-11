import { afterEach } from 'bun:test';

import { resetGlobalConfigOverrides } from '../src/lib/config';

if (!process.env.WHITEBIT_API_KEY) {
  process.env.WHITEBIT_API_KEY = 'test-key';
}

if (!process.env.WHITEBIT_API_SECRET) {
  process.env.WHITEBIT_API_SECRET = 'test-secret';
}

afterEach(() => {
  resetGlobalConfigOverrides();
});
