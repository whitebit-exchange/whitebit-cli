import type { LoadConfigOptions, OutputFormat } from './config';

const parseOutputFormat = (value: string | undefined): OutputFormat | undefined => {
  if (value === 'json' || value === 'table') {
    return value;
  }

  return undefined;
};

const readFlagValue = (
  argv: string[],
  index: number,
): { value: string | undefined; consumed: number } => {
  const token = argv[index] ?? '';
  const equalIndex = token.indexOf('=');
  if (equalIndex > -1) {
    return {
      value: token.slice(equalIndex + 1),
      consumed: 1,
    };
  }

  return {
    value: argv[index + 1],
    consumed: 2,
  };
};

export const parseGlobalConfigOverrides = (argv: string[]): LoadConfigOptions => {
  const overrides: LoadConfigOptions = {};

  for (let index = 0; index < argv.length; ) {
    const token = argv[index] ?? '';

    if (token === '--json') {
      overrides.json = true;
      index += 1;
      continue;
    }

    if (token === '--verbose' || token === '-V') {
      overrides.verbose = true;
      index += 1;
      continue;
    }

    if (token === '--dry-run') {
      overrides.dryRun = true;
      index += 1;
      continue;
    }

    if (token === '--raw') {
      overrides.raw = true;
      index += 1;
      continue;
    }

    if (token.startsWith('--format')) {
      const { value, consumed } = readFlagValue(argv, index);
      const format = parseOutputFormat(value);
      if (format) {
        overrides.format = format;
      }
      index += consumed;
      continue;
    }

    if (token.startsWith('--profile')) {
      const { value, consumed } = readFlagValue(argv, index);
      if (typeof value === 'string') {
        overrides.profile = value;
      }
      index += consumed;
      continue;
    }

    if (token.startsWith('--api-key')) {
      const { value, consumed } = readFlagValue(argv, index);
      if (typeof value === 'string') {
        overrides.apiKey = value;
      }
      index += consumed;
      continue;
    }

    if (token.startsWith('--api-secret')) {
      const { value, consumed } = readFlagValue(argv, index);
      if (typeof value === 'string') {
        overrides.apiSecret = value;
      }
      index += consumed;
      continue;
    }

    if (token.startsWith('--api-url')) {
      const { value, consumed } = readFlagValue(argv, index);
      if (typeof value === 'string') {
        overrides.apiUrl = value;
      }
      index += consumed;
      continue;
    }

    index += 1;
  }

  return overrides;
};
