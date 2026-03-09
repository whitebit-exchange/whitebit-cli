import { describe, expect, test } from 'bun:test';
import { collateralGroup, convertGroup, spotGroup, tradeGroup } from '../../../src/commands/trade';

describe('Trade Group Nesting', () => {
  test('tradeGroup has correct name', () => {
    expect(tradeGroup.name).toBe('trade');
    expect(tradeGroup.description).toBe('Trading commands (spot, collateral, convert)');
  });

  test('tradeGroup contains exactly 3 subgroups', () => {
    expect(tradeGroup.commands).toHaveLength(3);
  });

  test('tradeGroup contains spot subgroup', () => {
    const spot = tradeGroup.commands.find((cmd: any) => cmd.name === 'spot');
    expect(spot).toBeDefined();
    expect(spot?.description).toBe('Spot order management');
  });

  test('tradeGroup contains collateral subgroup', () => {
    const collateral = tradeGroup.commands.find((cmd: any) => cmd.name === 'collateral');
    expect(collateral).toBeDefined();
    expect(collateral?.description).toBe('Collateral trading commands');
  });

  test('tradeGroup contains convert subgroup', () => {
    const convert = tradeGroup.commands.find((cmd: any) => cmd.name === 'convert');
    expect(convert).toBeDefined();
    expect(convert?.description).toBe('Currency conversion commands');
  });

  test('spotGroup has correct name and command count', () => {
    expect(spotGroup.name).toBe('spot');
    expect(spotGroup.description).toBe('Spot order management');
    expect(spotGroup.commands).toHaveLength(18);
  });

  test('collateralGroup has correct name and command count', () => {
    expect(collateralGroup.name).toBe('collateral');
    expect(collateralGroup.description).toBe('Collateral trading commands');
    expect(collateralGroup.commands).toHaveLength(22);
  });

  test('convertGroup has correct name and command count', () => {
    expect(convertGroup.name).toBe('convert');
    expect(convertGroup.description).toBe('Currency conversion commands');
    expect(convertGroup.commands).toHaveLength(3);
  });
});
