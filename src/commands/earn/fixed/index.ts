import { defineGroup } from '@bunli/core';

import { accountCloseInvestmentCommand } from './close-investment';
import { accountInvestCommand } from './invest';
import { accountInvestmentsHistoryCommand } from './investments-history';
import { accountPlansCommand } from './plans';

export const fixedGroup = defineGroup({
  name: 'fixed',
  description: 'Fixed staking plans',
  commands: [
    accountPlansCommand,
    accountInvestCommand,
    accountInvestmentsHistoryCommand,
    accountCloseInvestmentCommand,
  ],
});
