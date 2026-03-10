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
      expect(balanceGroup.description).toBe(
        'View account balance: main (total) vs trading (available for spot trades)',
      );
    });

    test('contains 3 commands', () => {
      expect(balanceGroup.commands).toHaveLength(3);
    });
  });

  describe('deposit group', () => {
    test('has correct name and description', () => {
      expect(depositGroup.name).toBe('deposit');
      expect(depositGroup.description).toBe(
        'Get deposit addresses (crypto/fiat) and refund canceled deposits',
      );
    });

    test('contains 4 commands', () => {
      expect(depositGroup.commands).toHaveLength(4);
    });
  });

  describe('withdraw group', () => {
    test('has correct name and description', () => {
      expect(withdrawGroup.name).toBe('withdraw');
      expect(withdrawGroup.description).toBe(
        'Withdraw cryptocurrency and fiat funds to external addresses',
      );
    });

    test('contains 4 commands', () => {
      expect(withdrawGroup.commands).toHaveLength(4);
    });
  });

  describe('transfer group', () => {
    test('has correct name and description', () => {
      expect(transferGroup.name).toBe('transfer');
      expect(transferGroup.description).toBe(
        'Move funds between your own accounts (main, trade, collateral)',
      );
    });

    test('contains 1 command', () => {
      expect(transferGroup.commands).toHaveLength(1);
    });
  });

  describe('codes group', () => {
    test('has correct name and description', () => {
      expect(codesGroup.name).toBe('codes');
      expect(codesGroup.description).toBe(
        'Create and redeem WBe-prefixed vouchers for peer-to-peer value transfer',
      );
    });

    test('contains 4 commands', () => {
      expect(codesGroup.commands).toHaveLength(4);
    });
  });

  describe('earn group', () => {
    test('has correct name and description', () => {
      expect(earnGroup.name).toBe('earn');
      expect(earnGroup.description).toBe('Lock and stake tokens to earn passive yield and rewards');
    });

    test('contains 3 entries (fixedGroup, flexGroup, accountInterestHistoryCommand)', () => {
      expect(earnGroup.commands).toHaveLength(3);
    });
  });

  describe('fixed group', () => {
    test('has correct name and description', () => {
      expect(fixedGroup.name).toBe('fixed');
      expect(fixedGroup.description).toBe('Lock tokens for set period at guaranteed APR returns');
    });

    test('contains 4 commands', () => {
      expect(fixedGroup.commands).toHaveLength(4);
    });
  });

  describe('flex group', () => {
    test('has correct name and description', () => {
      expect(flexGroup.name).toBe('flex');
      expect(flexGroup.description).toBe(
        'Stake tokens with variable APR and withdraw anytime, penalty-free',
      );
    });

    test('contains 8 commands', () => {
      expect(flexGroup.commands).toHaveLength(8);
    });
  });
});
