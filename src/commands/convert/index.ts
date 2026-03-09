import { defineGroup } from '@bunli/core';

import { convertConfirmCommand } from './confirm';
import { convertEstimateCommand } from './estimate';
import { convertHistoryCommand } from './history';

export const convertGroup = defineGroup({
  name: 'convert',
  description: 'Currency conversion commands',
  commands: [convertEstimateCommand, convertConfirmCommand, convertHistoryCommand],
});
