import { defineGroup } from '@bunli/core';

import { accountBalanceCommand } from './balance';
import { accountFeeCommand } from './fee';
import { accountMainBalanceCommand } from './main-balance';

export const balanceGroup = defineGroup({
  name: 'balance',
  description: 'View account balance: main (total) vs trading (available for spot trades)',
  commands: [accountMainBalanceCommand, accountBalanceCommand, accountFeeCommand],
});
