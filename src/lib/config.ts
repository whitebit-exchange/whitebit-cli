import { existsSync, readFileSync, statSync } from 'node:fs';
import { chmod, mkdir, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { parse, stringify } from 'smol-toml';
import { z } from 'zod';

import type { AuthConfig, PublicConfig } from './types';

export type OutputFormat = 'json' | 'table';
export type ConfigValueSource = 'cli' | 'env' | 'config' | 'default' | 'missing';

export interface LoadConfigOptions {
  profile?: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  format?: OutputFormat;
  json?: boolean;
  verbose?: boolean;
  retry?: boolean;
  dryRun?: boolean;
}

export interface LoadedConfig {
  profile: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl: string;
  format: OutputFormat;
  verbose: boolean;
  retry: boolean;
  dryRun: boolean;
  sources: {
    apiKey: ConfigValueSource;
    apiSecret: ConfigValueSource;
    apiUrl: Exclude<ConfigValueSource, 'missing'>;
    format: Exclude<ConfigValueSource, 'missing'>;
  };
}

export interface SaveConfigProfileInput {
  profile?: string;
  apiKey: string;
  apiSecret: string;
  defaultFormat?: OutputFormat;
  apiUrl?: string;
}

type TomlDocument = Record<string, unknown>;

interface TomlProfile {
  api_key?: string;
  api_secret?: string;
  default_format?: OutputFormat;
  api_url?: string;
}

const DEFAULT_API_URL = 'https://whitebit.com';
const DEFAULT_PROFILE = 'default';
const DEFAULT_FORMAT: OutputFormat = 'table';
const CONFIG_DIRECTORY_MODE = 0o700;
const CONFIG_FILE_MODE = 0o600;

const formatSchema = z.enum(['json', 'table']);
const urlSchema = z.url();

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeApiUrl = (url: string): string => url.replace(/\/+$/, '');

const validateApiUrl = (url: string, source: ConfigValueSource): string => {
  const parsed = urlSchema.safeParse(url);
  if (!parsed.success) {
    throw new Error(`Invalid API URL from ${source}: ${url}`);
  }

  return normalizeApiUrl(parsed.data);
};

const resolveHomeDir = (): string => {
  if (hasText(process.env.HOME)) {
    return process.env.HOME;
  }

  if (hasText(process.env.USERPROFILE)) {
    return process.env.USERPROFILE;
  }

  return homedir();
};

const getConfigDirPath = (): string => join(resolveHomeDir(), '.whitebit');

export const getConfigFilePath = (): string => join(getConfigDirPath(), 'config.toml');

const readTomlDocument = (configPath: string): TomlDocument => {
  if (!existsSync(configPath)) {
    return {};
  }

  const raw = readFileSync(configPath, 'utf8');
  if (raw.trim().length === 0) {
    return {};
  }

  try {
    const parsed = parse(raw);
    return isObjectRecord(parsed) ? parsed : {};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse TOML config at ${configPath}: ${message}`);
  }
};

const readTomlProfile = (document: TomlDocument, profile: string): TomlProfile => {
  const value = document[profile];
  if (!isObjectRecord(value)) {
    return {};
  }

  const parsedProfile: TomlProfile = {};

  if (hasText(value.api_key)) {
    parsedProfile.api_key = value.api_key;
  }

  if (hasText(value.api_secret)) {
    parsedProfile.api_secret = value.api_secret;
  }

  if (hasText(value.default_format)) {
    const parsedFormat = formatSchema.safeParse(value.default_format);
    if (parsedFormat.success) {
      parsedProfile.default_format = parsedFormat.data;
    }
  }

  if (hasText(value.api_url)) {
    parsedProfile.api_url = value.api_url;
  }

  return parsedProfile;
};

const warnIfConfigPermissionsAreLoose = (configPath: string): void => {
  if (!existsSync(configPath) || process.platform === 'win32') {
    return;
  }

  const mode = statSync(configPath).mode & 0o777;
  if (mode === CONFIG_FILE_MODE) {
    return;
  }

  process.stderr.write(
    `[whitebit] Warning: config file permissions are ${mode
      .toString(8)
      .padStart(4, '0')}, expected 0600 for ${configPath}\n`,
  );
};

const resolveProfileName = (profile?: string): string => {
  if (!hasText(profile)) {
    return DEFAULT_PROFILE;
  }

  return profile.trim();
};

const resolveConfigValue = (
  cliValue: string | undefined,
  envValue: string | undefined,
  tomlValue: string | undefined,
): { value?: string; source: ConfigValueSource } => {
  if (hasText(cliValue)) {
    return { value: cliValue, source: 'cli' };
  }

  if (hasText(envValue)) {
    return { value: envValue, source: 'env' };
  }

  if (hasText(tomlValue)) {
    return { value: tomlValue, source: 'config' };
  }

  return { source: 'missing' };
};

const resolveFormat = (
  options: LoadConfigOptions,
  profile: TomlProfile,
): { value: OutputFormat; source: Exclude<ConfigValueSource, 'missing'> } => {
  if (options.json) {
    return { value: 'json', source: 'cli' };
  }

  const cliFormat = formatSchema.safeParse(options.format);
  if (cliFormat.success) {
    return { value: cliFormat.data, source: 'cli' };
  }

  if (profile.default_format) {
    return { value: profile.default_format, source: 'config' };
  }

  return { value: DEFAULT_FORMAT, source: 'default' };
};

const resolveApiUrl = (
  options: LoadConfigOptions,
  profile: TomlProfile,
): { value: string; source: Exclude<ConfigValueSource, 'missing'> } => {
  if (hasText(options.apiUrl)) {
    return {
      value: validateApiUrl(options.apiUrl, 'cli'),
      source: 'cli',
    };
  }

  if (hasText(process.env.WHITEBIT_API_URL)) {
    return {
      value: validateApiUrl(process.env.WHITEBIT_API_URL, 'env'),
      source: 'env',
    };
  }

  if (hasText(profile.api_url)) {
    return {
      value: validateApiUrl(profile.api_url, 'config'),
      source: 'config',
    };
  }

  return {
    value: DEFAULT_API_URL,
    source: 'default',
  };
};

const coerceRetry = (value: boolean | undefined): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  return true;
};

let globalConfigOverrides: LoadConfigOptions = {};

export const setGlobalConfigOverrides = (overrides: LoadConfigOptions): void => {
  globalConfigOverrides = overrides;
};

export const getGlobalConfigOverrides = (): LoadConfigOptions => {
  return globalConfigOverrides;
};

export const resetGlobalConfigOverrides = (): void => {
  globalConfigOverrides = {};
};

export const loadConfig = (options: LoadConfigOptions = {}): LoadedConfig => {
  const merged = { ...globalConfigOverrides, ...options };
  const hasExplicitOptions = Object.keys(options).length > 0;

  const profileName = resolveProfileName(merged.profile);
  const configPath = getConfigFilePath();
  const parsedConfig = readTomlDocument(configPath);
  const profile = readTomlProfile(parsedConfig, profileName);
  warnIfConfigPermissionsAreLoose(configPath);

  const apiKey = resolveConfigValue(merged.apiKey, process.env.WHITEBIT_API_KEY, profile.api_key);
  const apiSecret = resolveConfigValue(
    merged.apiSecret,
    process.env.WHITEBIT_API_SECRET,
    profile.api_secret,
  );
  const apiUrl = resolveApiUrl(merged, profile);
  const format = resolveFormat(merged, profile);

  const config: LoadedConfig = {
    profile: profileName,
    apiKey: apiKey.value,
    apiSecret: apiSecret.value,
    apiUrl: apiUrl.value,
    format: format.value,
    verbose: merged.verbose ?? false,
    retry: coerceRetry(merged.retry),
    dryRun: merged.dryRun ?? false,
    sources: {
      apiKey: apiKey.source,
      apiSecret: apiSecret.source,
      apiUrl: apiUrl.source,
      format: format.source,
    },
  };

  if (hasExplicitOptions) {
    globalConfigOverrides = {
      verbose: config.verbose || undefined,
      dryRun: config.dryRun || undefined,
      retry: merged.retry,
    };
  }

  return config;
};

export const loadPublicConfig = (options?: LoadConfigOptions): PublicConfig => {
  const config = loadConfig(options ?? {});
  return {
    apiUrl: config.apiUrl,
  };
};

export const loadAuthConfig = (options?: LoadConfigOptions): AuthConfig => {
  const config = loadConfig(options ?? {});
  if (!hasText(config.apiKey) || !hasText(config.apiSecret)) {
    throw new Error(
      'Missing WhiteBIT API credentials. Set WHITEBIT_API_KEY and WHITEBIT_API_SECRET or run `whitebit config set --api-key ... --api-secret ...`.',
    );
  }

  return {
    apiKey: config.apiKey.trim(),
    apiSecret: config.apiSecret.trim(),
    apiUrl: config.apiUrl,
  };
};

const upsertProfileInDocument = (
  document: TomlDocument,
  input: SaveConfigProfileInput,
): TomlDocument => {
  const profileName = resolveProfileName(input.profile);
  const current = isObjectRecord(document[profileName]) ? document[profileName] : {};
  const nextProfile: Record<string, unknown> = {
    ...current,
    api_key: input.apiKey,
    api_secret: input.apiSecret,
  };

  if (input.defaultFormat) {
    nextProfile.default_format = input.defaultFormat;
  }

  if (hasText(input.apiUrl)) {
    nextProfile.api_url = validateApiUrl(input.apiUrl, 'cli');
  }

  return {
    ...document,
    [profileName]: nextProfile,
  };
};

export const saveConfigProfile = async (input: SaveConfigProfileInput): Promise<string> => {
  const profileName = resolveProfileName(input.profile);
  const configPath = getConfigFilePath();
  const configDir = dirname(configPath);
  const tempPath = `${configPath}.tmp`;

  await mkdir(configDir, { recursive: true, mode: CONFIG_DIRECTORY_MODE });
  if (process.platform !== 'win32') {
    await chmod(configDir, CONFIG_DIRECTORY_MODE);
  }

  const currentDocument = readTomlDocument(configPath);
  const nextDocument = upsertProfileInDocument(currentDocument, {
    ...input,
    profile: profileName,
  });
  const renderedToml = stringify(nextDocument);

  await writeFile(tempPath, renderedToml, {
    encoding: 'utf8',
    mode: CONFIG_FILE_MODE,
  });
  if (process.platform !== 'win32') {
    await chmod(tempPath, CONFIG_FILE_MODE);
  }

  await rename(tempPath, configPath);
  if (process.platform !== 'win32') {
    await chmod(configPath, CONFIG_FILE_MODE);
  }

  return configPath;
};

export const maskSecret = (value: string | undefined): string => {
  if (!hasText(value)) {
    return '(not set)';
  }

  const suffix = value.slice(-4);
  return `****${suffix}`;
};
