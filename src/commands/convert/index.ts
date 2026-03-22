import { defineGroup } from '@bunli/core';

import { convertConfirmCommand } from './confirm';
import { convertEstimateCommand } from './estimate';
import { convertHistoryCommand } from './history';

export const convertGroup = defineGroup({
  name: 'convert',
  description: 'Convert between currencies (estimate rate → confirm transaction)',
  commands: [convertEstimateCommand, convertConfirmCommand, convertHistoryCommand],
});
