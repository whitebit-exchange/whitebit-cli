import { defineGroup } from '@bunli/core';

import { accountTransferCommand } from './transfer';

export const transferGroup = defineGroup({
  name: 'transfer',
  description: 'Move funds between your own accounts (main, spot, collateral)',
  commands: [accountTransferCommand],
});
