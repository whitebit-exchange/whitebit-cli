import { defineGroup } from '@bunli/core';

import { miningPoolHashrateCommand } from './hashrate';
import { miningPoolOverviewCommand } from './overview';

export const miningPoolGroup = defineGroup({
  name: 'mining-pool',
  description: 'Mining pool statistics and hashrate',
  commands: [miningPoolOverviewCommand, miningPoolHashrateCommand],
});
