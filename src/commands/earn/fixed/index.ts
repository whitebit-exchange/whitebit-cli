import { defineGroup } from '@bunli/core';

import { accountCloseInvestmentCommand } from './close-investment';
import { accountInvestCommand } from './invest';
import { accountInvestmentsHistoryCommand } from './investments-history';
import { accountPlansCommand } from './plans';

export const fixedGroup = defineGroup({
  name: 'fixed',
  description: 'Lock tokens for set period at guaranteed APR',
  commands: [
    accountPlansCommand,
    accountInvestCommand,
    accountInvestmentsHistoryCommand,
    accountCloseInvestmentCommand,
  ],
});
