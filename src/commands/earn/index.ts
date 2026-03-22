import { defineGroup } from '@bunli/core';
import { fixedGroup } from './fixed';
import { flexGroup } from './flex';
import { accountInterestHistoryCommand } from './interest-history';

export const earnGroup = defineGroup({
  name: 'earn',
  description: 'Lock and stake tokens to earn passive yield and rewards',
  commands: [fixedGroup, flexGroup, accountInterestHistoryCommand],
});

export { fixedGroup, flexGroup };
