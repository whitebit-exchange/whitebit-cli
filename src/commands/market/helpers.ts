const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const unwrapWhitebitPayload = <T>(data: unknown): T => {
  if (isRecord(data) && 'result' in data) {
    return data.result as T;
  }

  if (isRecord(data) && 'data' in data) {
    return data.data as T;
  }

  return data as T;
};

export const recordToRows = (data: unknown, keyName: string): unknown => {
  if (!isRecord(data)) {
    return data;
  }

  return Object.entries(data).map(([key, value]) => {
    if (isRecord(value)) {
      return {
        [keyName]: key,
        ...value,
      };
    }

    return {
      [keyName]: key,
      value,
    };
  });
};

export const recordOfArraysToRows = (data: unknown, keyName: string): unknown[] => {
  if (!isRecord(data)) {
    return Array.isArray(data) ? data : [];
  }

  const rows: Record<string, unknown>[] = [];
  for (const [key, items] of Object.entries(data)) {
    if (Array.isArray(items)) {
      for (const item of items) {
        rows.push({ [keyName]: key, ...(isRecord(item) ? item : { value: item }) });
      }
    }
  }

  return rows;
};
