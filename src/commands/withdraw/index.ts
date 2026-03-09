import { defineGroup } from '@bunli/core';

import { accountWithdrawCryptoCommand } from './withdraw-crypto';
import { accountWithdrawCryptoAmountCommand } from './withdraw-crypto-amount';
import { accountWithdrawFiatCommand } from './withdraw-fiat';
import { accountWithdrawHistoryCommand } from './withdraw-history';

export const withdrawGroup = defineGroup({
  name: 'withdraw',
  description: 'Crypto and fiat withdrawals',
  commands: [
    accountWithdrawCryptoCommand,
    accountWithdrawCryptoAmountCommand,
    accountWithdrawFiatCommand,
    accountWithdrawHistoryCommand,
  ],
});
