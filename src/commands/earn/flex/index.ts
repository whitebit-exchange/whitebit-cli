import { defineGroup } from '@bunli/core';

import { accountFlexAutoReinvestCommand } from './flex-auto-reinvest';
import { accountFlexCloseCommand } from './flex-close';
import { accountFlexInvestCommand } from './flex-invest';
import { accountFlexInvestmentHistoryCommand } from './flex-investment-history';
import { accountFlexInvestmentsCommand } from './flex-investments';
import { accountFlexPaymentHistoryCommand } from './flex-payment-history';
import { accountFlexPlansCommand } from './flex-plans';
import { accountFlexWithdrawCommand } from './flex-withdraw';

export const flexGroup = defineGroup({
  name: 'flex',
  description: 'Flexible staking',
  commands: [
    accountFlexPlansCommand,
    accountFlexInvestCommand,
    accountFlexInvestmentsCommand,
    accountFlexInvestmentHistoryCommand,
    accountFlexPaymentHistoryCommand,
    accountFlexWithdrawCommand,
    accountFlexCloseCommand,
    accountFlexAutoReinvestCommand,
  ],
});
