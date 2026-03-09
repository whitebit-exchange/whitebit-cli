import { describe, expect, test } from 'bun:test';
import { balanceGroup } from '../../../src/commands/balance';
import { codesGroup } from '../../../src/commands/codes';
import { depositGroup } from '../../../src/commands/deposit';
import { earnGroup, fixedGroup, flexGroup } from '../../../src/commands/earn';
import { transferGroup } from '../../../src/commands/transfer';
import { withdrawGroup } from '../../../src/commands/withdraw';

describe('Account Command Groups Nesting', () => {
  describe('balance group', () => {
    test('has correct name and description', () => {
      expect(balanceGroup.name).toBe('balance');
      expect(balanceGroup.description).toBe('Account balance queries');
    });

    test('contains 3 commands', () => {
      expect(balanceGroup.commands).toHaveLength(3);
    });
  });

  describe('deposit group', () => {
    test('has correct name and description', () => {
      expect(depositGroup.name).toBe('deposit');
      expect(depositGroup.description).toBe('Deposit addresses and refunds');
    });

    test('contains 4 commands', () => {
      expect(depositGroup.commands).toHaveLength(4);
    });
  });

  describe('withdraw group', () => {
    test('has correct name and description', () => {
      expect(withdrawGroup.name).toBe('withdraw');
      expect(withdrawGroup.description).toBe('Crypto and fiat withdrawals');
    });

    test('contains 4 commands', () => {
      expect(withdrawGroup.commands).toHaveLength(4);
    });
  });

  describe('transfer group', () => {
    test('has correct name and description', () => {
      expect(transferGroup.name).toBe('transfer');
      expect(transferGroup.description).toBe('Internal account transfers');
    });

    test('contains 1 command', () => {
      expect(transferGroup.commands).toHaveLength(1);
    });
  });

  describe('codes group', () => {
    test('has correct name and description', () => {
      expect(codesGroup.name).toBe('codes');
      expect(codesGroup.description).toBe('Redemption codes');
    });

    test('contains 4 commands', () => {
      expect(codesGroup.commands).toHaveLength(4);
    });
  });

  describe('earn group', () => {
    test('has correct name and description', () => {
      expect(earnGroup.name).toBe('earn');
      expect(earnGroup.description).toBe('Staking and yield (fixed, flex, interest)');
    });

    test('contains 3 entries (fixedGroup, flexGroup, accountInterestHistoryCommand)', () => {
      expect(earnGroup.commands).toHaveLength(3);
    });
  });

  describe('fixed group', () => {
    test('has correct name and description', () => {
      expect(fixedGroup.name).toBe('fixed');
      expect(fixedGroup.description).toBe('Fixed staking plans');
    });

    test('contains 4 commands', () => {
      expect(fixedGroup.commands).toHaveLength(4);
    });
  });

  describe('flex group', () => {
    test('has correct name and description', () => {
      expect(flexGroup.name).toBe('flex');
      expect(flexGroup.description).toBe('Flexible staking');
    });

    test('contains 8 commands', () => {
      expect(flexGroup.commands).toHaveLength(8);
    });
  });
});
