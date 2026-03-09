import { defineGroup } from '@bunli/core';

import { accountApplyCodeCommand } from './apply-code';
import { accountCodesHistoryCommand } from './codes-history';
import { accountCreateCodeCommand } from './create-code';
import { accountMyCodesCommand } from './my-codes';

export const codesGroup = defineGroup({
  name: 'codes',
  description: 'Redemption codes',
  commands: [
    accountCreateCodeCommand,
    accountApplyCodeCommand,
    accountCodesHistoryCommand,
    accountMyCodesCommand,
  ],
});
