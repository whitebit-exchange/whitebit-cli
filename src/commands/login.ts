import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadConfig, saveConfigProfile } from '../lib/config';
import { formatOutput } from '../lib/formatter';
import { startLoginUIServer } from '../lib/login-ui-server';

interface LoginValues {
  profile?: string;
  apiKey: string;
  apiSecret: string;
  apiUrl?: string;
}

const normalizeOptional = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Reads a secret from stdin without echoing characters.
 * Uses raw mode so no keystrokes appear on screen.
 * Must only be called when stdin is a TTY and readline is not active.
 */
const readSecret = (prompt: string): Promise<string> =>
  new Promise((resolve, reject) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let value = '';

    const cleanup = () => {
      process.stdin.removeListener('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    const onData = (chunk: Buffer) => {
      const char = chunk.toString('utf8');

      if (char === '\r' || char === '\n') {
        cleanup();
        process.stdout.write('\n');
        resolve(value);
      } else if (char === '\u0003') {
        // Ctrl+C — restore terminal state before exiting
        cleanup();
        process.stdout.write('\n');
        reject(new Error('Interrupted'));
      } else if (char === '\u007f' || char === '\b') {
        // Backspace / DEL — remove last char silently
        value = value.slice(0, -1);
      } else if (char >= ' ') {
        // Printable character — accumulate without echo
        value += char;
      }
    };

    process.stdin.on('data', onData);
  });

const collectInteractiveLoginValues = async (
  defaults: Partial<LoginValues> = {},
): Promise<LoginValues> => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      'Interactive login requires a TTY terminal. Use `whitebit login --api-key ... --api-secret ...`.',
    );
  }

  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  let profileAnswer: string;
  let apiKeyAnswer: string;
  let apiUrlAnswer: string;

  try {
    process.stdout.write('WhiteBIT Login\n');

    profileAnswer = await rl.question(`Profile [${defaults.profile ?? 'default'}]: `);
    apiKeyAnswer = await rl.question('API key: ');
    apiUrlAnswer = await rl.question(`API URL [${defaults.apiUrl ?? 'https://whitebit.com'}]: `);
  } finally {
    // Close readline before entering raw mode — two stdin listeners conflict.
    rl.close();
  }

  // Secret is collected last, after readline releases stdin.
  const apiSecretAnswer = await readSecret('API secret: ');

  const profile = normalizeOptional(profileAnswer) ?? defaults.profile ?? 'default';
  const apiKey = apiKeyAnswer.trim();
  const apiSecret = apiSecretAnswer.trim();
  const apiUrl = normalizeOptional(apiUrlAnswer) ?? defaults.apiUrl ?? 'https://whitebit.com';

  if (apiKey.length === 0 || apiSecret.length === 0) {
    throw new Error('Missing required argument: API key and secret cannot be empty');
  }

  return {
    profile,
    apiKey,
    apiSecret,
    apiUrl,
  };
};

export const runLogin = async (flags: {
  profile?: string;
  'api-key'?: string;
  'api-secret'?: string;
  'api-url'?: string;
  ui?: boolean;
}): Promise<void> => {
  if (flags.ui) {
    if (
      (typeof flags['api-key'] === 'string' && flags['api-key'].trim().length > 0) ||
      (typeof flags['api-secret'] === 'string' && flags['api-secret'].trim().length > 0)
    ) {
      throw new Error('--ui cannot be combined with --api-key or --api-secret');
    }

    const { promise, server } = startLoginUIServer({
      profile: flags.profile,
      apiUrl: flags['api-url'],
    });

    const port = server.port;
    console.log(`\n🌐 WhiteBIT Login UI is running!`);
    console.log(`\n👉 Open this URL in your browser to enter credentials securely:`);
    console.log(`   http://127.0.0.1:${port}\n`);
    console.log(`Waiting for credentials to be submitted in the browser...\n`);

    const loginValues = await promise;

    const configPath = await saveConfigProfile(loginValues);
    const runtimeConfig = loadConfig({
      profile: loginValues.profile,
      apiKey: loginValues.apiKey,
      apiSecret: loginValues.apiSecret,
      apiUrl: loginValues.apiUrl,
    });

    formatOutput(
      {
        updated: true,
        profile: runtimeConfig.profile,
        config_path: configPath,
        api_key: 'saved',
        api_secret: 'saved',
        api_url: runtimeConfig.apiUrl,
        interactive: 'ui',
      },
      { format: runtimeConfig.format },
    );
    return;
  }

  const hasInlineCredentials =
    typeof flags['api-key'] === 'string' &&
    flags['api-key'].trim().length > 0 &&
    typeof flags['api-secret'] === 'string' &&
    flags['api-secret'].trim().length > 0;

  const loginValues = hasInlineCredentials
    ? {
        profile: flags.profile,
        apiKey: flags['api-key'] ?? '',
        apiSecret: flags['api-secret'] ?? '',
        apiUrl: flags['api-url'],
      }
    : await collectInteractiveLoginValues({
        profile: flags.profile,
        apiKey: flags['api-key'],
        apiSecret: flags['api-secret'],
        apiUrl: flags['api-url'],
      });

  const configPath = await saveConfigProfile(loginValues);
  const runtimeConfig = loadConfig({
    profile: loginValues.profile,
    apiKey: loginValues.apiKey,
    apiSecret: loginValues.apiSecret,
    apiUrl: loginValues.apiUrl,
  });

  formatOutput(
    {
      updated: true,
      profile: runtimeConfig.profile,
      config_path: configPath,
      api_key: 'saved',
      api_secret: 'saved',
      api_url: runtimeConfig.apiUrl,
      interactive: !hasInlineCredentials,
    },
    { format: runtimeConfig.format },
  );
};

export const loginCommand = defineCommand({
  name: 'login',
  description: 'Authenticate and save WhiteBIT API credentials (interactive or with flags)',
  options: {
    'api-key': option(z.string().min(1).optional(), {
      description: 'API key for authentication',
    }),
    'api-secret': option(z.string().min(1).optional(), {
      description: 'API secret for authentication',
    }),
    'api-url': option(z.string().min(1).optional(), {
      description: 'Base API URL (https://whitebit.com or https://whitebit.eu)',
    }),
    profile: option(z.string().min(1).optional(), {
      description: 'Config profile name',
    }),
    ui: option(z.boolean().optional(), {
      description: 'Open a local web UI to enter credentials securely',
    }),
  },
  handler: async ({ flags }) => {
    await runLogin(flags);
  },
});
