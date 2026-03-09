import { defineGroup } from '@bunli/core';
import { fixedGroup } from './fixed';
import { flexGroup } from './flex';
import { accountInterestHistoryCommand } from './interest-history';

export const earnGroup = defineGroup({
  name: 'earn',
  description: 'Staking and yield (fixed, flex, interest)',
  commands: [fixedGroup, flexGroup, accountInterestHistoryCommand],
});

export { fixedGroup, flexGroup };
