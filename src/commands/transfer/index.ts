import { defineGroup } from '@bunli/core';

import { accountTransferCommand } from './transfer';

export const transferGroup = defineGroup({
  name: 'transfer',
  description: 'Internal account transfers',
  commands: [accountTransferCommand],
});
