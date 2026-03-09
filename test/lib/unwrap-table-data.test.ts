import { describe, expect, test } from 'bun:test';

import { unwrapTableData } from '../../src/lib/formatter';

describe('unwrapTableData', () => {
  test('unwraps { data: [...] } wrapper and returns inner array', () => {
    const wrapper = { data: [{ a: 1 }], limit: 10, offset: 0 };
    const result = unwrapTableData(wrapper);
    expect(result).toEqual([{ a: 1 }]);
  });

  test('unwraps { records: [...] } wrapper and returns inner array', () => {
    const wrapper = { records: [{ b: 2 }], total: 5, limit: 10, offset: 0 };
    const result = unwrapTableData(wrapper);
    expect(result).toEqual([{ b: 2 }]);
  });

  test('returns plain array unchanged', () => {
    const arr = [{ c: 3 }];
    const result = unwrapTableData(arr);
    expect(result).toBe(arr); // Same reference
  });

  test('returns flat object unchanged (no wrapper)', () => {
    const obj = { id: 1, name: 'foo' };
    const result = unwrapTableData(obj);
    expect(result).toBe(obj); // Same reference
  });

  test('does not unwrap when .data is not an array', () => {
    const wrapper = { data: 'not-array' };
    const result = unwrapTableData(wrapper);
    expect(result).toBe(wrapper); // Same reference
  });

  test('does not unwrap when .records is not an array', () => {
    const wrapper = { records: 'not-array' };
    const result = unwrapTableData(wrapper);
    expect(result).toBe(wrapper); // Same reference
  });

  test('returns null unchanged', () => {
    const result = unwrapTableData(null);
    expect(result).toBeNull();
  });

  test('returns undefined unchanged', () => {
    const result = unwrapTableData(undefined);
    expect(result).toBeUndefined();
  });

  test('unwraps empty array from { data: [] }', () => {
    const wrapper = { data: [], limit: 100 };
    const result = unwrapTableData(wrapper);
    expect(result).toEqual([]);
  });

  test('unwraps empty array from { records: [] } with pagination metadata', () => {
    const wrapper = { records: [], limit: 100, offset: 0, total: 0 };
    const result = unwrapTableData(wrapper);
    expect(result).toEqual([]);
  });

  test('prefers .records over .data when both exist', () => {
    const wrapper = { records: [{ from: 'records' }], data: [{ from: 'data' }] };
    const result = unwrapTableData(wrapper);
    expect(result).toEqual([{ from: 'records' }]);
  });

  test('handles nested data.data by unwrapping only one level', () => {
    const wrapper = { data: { data: [{ nested: true }] } };
    const result = unwrapTableData(wrapper);
    // .data is an object, not an array, so it should return unchanged
    expect(result).toBe(wrapper);
  });
});
