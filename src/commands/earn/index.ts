import { defineGroup } from '@bunli/core';
import { fixedGroup } from './fixed';
import { flexGroup } from './flex';
import { accountInterestHistoryCommand } from './interest-history';

export const earnGroup = defineGroup({
  name: 'earn',
  description: 'Stake tokens for yield and earn interest rewards',
  commands: [fixedGroup, flexGroup, accountInterestHistoryCommand],
});

export { fixedGroup, flexGroup };
