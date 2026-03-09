import { defineGroup } from '@bunli/core';

import { accountCreateAddressCommand } from './create-address';
import { accountDepositAddressCommand } from './deposit-address';
import { accountDepositRefundCommand } from './deposit-refund';
import { accountFiatDepositAddressCommand } from './fiat-deposit-address';

export const depositGroup = defineGroup({
  name: 'deposit',
  description: 'Deposit addresses and refunds',
  commands: [
    accountDepositAddressCommand,
    accountFiatDepositAddressCommand,
    accountCreateAddressCommand,
    accountDepositRefundCommand,
  ],
});
