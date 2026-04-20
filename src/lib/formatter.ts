import { getGlobalConfigOverrides } from './config';

export type OutputFormat = 'json' | 'table';

const MAX_CELL = 80;
const RED = '\u001b[31m';
const DIM = '\u001b[2m';
const RST = '\u001b[0m';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const truncate = (s: string): string =>
  s.length <= MAX_CELL ? s : `${s.slice(0, MAX_CELL - 3)}...`;

const cell = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return truncate(v);
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
  return truncate(JSON.stringify(v));
};

const flatten = (row: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isRecord(v)) Object.assign(result, flatten(v, key));
    else if (Array.isArray(v)) result[key] = truncate(JSON.stringify(v));
    else result[key] = v;
  }
  return result;
};

const unwrap = (data: unknown): unknown => {
  if (!isRecord(data)) return data;
  if ('records' in data && Array.isArray(data.records)) return data.records;
  if ('data' in data && Array.isArray(data.data)) return data.data;
  return data;
};

const rows = (data: unknown): Record<string, unknown>[] => {
  const d = unwrap(data);
  if (Array.isArray(d)) return d.map((item) => (isRecord(item) ? flatten(item) : { value: item }));
  if (isRecord(d)) return [flatten(d)];
  return [{ value: d }];
};

const headers = (r: Record<string, unknown>[]): string[] => {
  const h: string[] = [];
  for (const row of r) for (const k of Object.keys(row)) if (!h.includes(k)) h.push(k);
  return h;
};

const renderTable = (data: unknown): string => {
  const r = rows(data);
  if (r.length === 0) return 'No results found';
  const h = headers(r);
  const w = h.map((hdr) => Math.max(hdr.length, ...r.map((row) => cell(row[hdr]).length)));
  const border = `+${w.map((n) => '-'.repeat(n + 2)).join('+')}+`;
  const hdrRow = `| ${h.map((hdr, i) => hdr.padEnd(w[i] ?? 0)).join(' | ')} |`;
  const dataRows = r.map(
    (row) => `| ${h.map((hdr, i) => cell(row[hdr]).padEnd(w[i] ?? 0)).join(' | ')} |`,
  );
  return [border, hdrRow, border, ...dataRows, border].join('\n');
};

export const formatOutput = (data: unknown, format: OutputFormat): void => {
  const overrides = getGlobalConfigOverrides();
  const raw = overrides.raw ?? false;
  if (format === 'json') {
    process.stdout.write(`${JSON.stringify(raw ? data : { success: true, data }, null, 2)}\n`);
  } else {
    process.stdout.write(`${renderTable(data)}\n`);
  }
};

export const formatError = (error: unknown, format?: OutputFormat): void => {
  const msg = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  const suggestion =
    isRecord(error) && typeof (error as { suggestion?: unknown }).suggestion === 'string'
      ? (error as { suggestion: string }).suggestion
      : undefined;

  if (format === 'json') {
    process.stderr.write(
      `${JSON.stringify({ success: false, error: { message: msg, ...(suggestion ? { suggestion } : {}) } }, null, 2)}\n`,
    );
    return;
  }
  process.stderr.write(`${RED}Error${RST}: ${msg}\n`);
  if (suggestion) process.stderr.write(`${DIM}Hint: ${suggestion}${RST}\n`);
};
