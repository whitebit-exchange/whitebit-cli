import type { ApiResponse } from './types';

export type OutputFormat = 'json' | 'table';

export interface FormatOutputOptions {
  format: OutputFormat;
}

export interface FormattedError {
  code: string;
  message: string;
  details?: unknown;
}

export interface FormatErrorOptions {
  format?: OutputFormat;
}

const MAX_TABLE_CELL_LENGTH = 50;
const ANSI_RED = '\u001b[31m';
const ANSI_RESET = '\u001b[0m';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const truncate = (value: string): string => {
  if (value.length <= MAX_TABLE_CELL_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_TABLE_CELL_LENGTH - 3)}...`;
};

const normalizeCellValue = (value: unknown): string => {
  if (value === null || typeof value === 'undefined') {
    return '';
  }

  if (typeof value === 'string') {
    return truncate(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  return truncate(JSON.stringify(value));
};

const collectRows = (data: unknown): Record<string, unknown>[] => {
  if (Array.isArray(data)) {
    return data.map((item) => (isRecord(item) ? item : { value: item }));
  }

  if (isRecord(data)) {
    return [data];
  }

  return [{ value: data }];
};

const collectHeaders = (rows: Record<string, unknown>[]): string[] => {
  const headers: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!headers.includes(key)) {
        headers.push(key);
      }
    }
  }

  return headers;
};

const renderTable = (data: unknown): string => {
  const rows = collectRows(data);
  if (rows.length === 0) {
    return 'No results found';
  }

  const headers = collectHeaders(rows);
  const widths = headers.map((header) => {
    const rowMax = rows.reduce((max, row) => {
      const value = normalizeCellValue(row[header]);
      return Math.max(max, value.length);
    }, 0);

    return Math.max(header.length, rowMax);
  });
  const border = `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
  const headerRow = `| ${headers
    .map((header, index) => header.padEnd(widths[index] ?? 0))
    .join(' | ')} |`;
  const dataRows = rows.map(
    (row) =>
      `| ${headers
        .map((header, index) => normalizeCellValue(row[header]).padEnd(widths[index] ?? 0))
        .join(' | ')} |`,
  );

  return [border, headerRow, border, ...dataRows, border].join('\n');
};

const normalizeError = (error: unknown): FormattedError => {
  if (isRecord(error) && typeof error.message === 'string') {
    const code =
      typeof error.code === 'string' && error.code.length > 0 ? error.code : 'ERR_UNKNOWN';
    return {
      code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'ERR_UNKNOWN',
      message: error.message,
    };
  }

  return {
    code: 'ERR_UNKNOWN',
    message: 'Unknown error',
    details: error,
  };
};

export const formatOutput = (data: unknown, options: FormatOutputOptions): void => {
  if (options.format === 'json') {
    process.stdout.write(`${JSON.stringify({ success: true, data }, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${renderTable(data)}\n`);
};

export const formatError = (error: unknown, options: FormatErrorOptions = {}): void => {
  const normalized = normalizeError(error);
  if (options.format === 'json') {
    process.stderr.write(`${JSON.stringify({ success: false, error: normalized }, null, 2)}\n`);
    return;
  }

  process.stderr.write(`${ANSI_RED}Error${ANSI_RESET}: ${normalized.message}\n`);
  if (typeof normalized.details !== 'undefined') {
    process.stderr.write(`${JSON.stringify(normalized.details, null, 2)}\n`);
  }
};

export const printJson = (payload: ApiResponse): void => {
  formatOutput(payload, { format: 'json' });
};
