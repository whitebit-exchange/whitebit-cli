import { defineGroup } from '@bunli/core';
import { apiKeyCreateCommand } from './api-key-create';
import { apiKeyDeleteCommand } from './api-key-delete';
import { apiKeyEditCommand } from './api-key-edit';
import { apiKeyListCommand } from './api-key-list';
import { apiKeyResetCommand } from './api-key-reset';
import { balanceCommand } from './balance';
import { blockCommand } from './block';
import { createCommand } from './create';
import { deleteCommand } from './delete';
import { editCommand } from './edit';
import { ipAddCommand } from './ip-add';
import { ipDeleteCommand } from './ip-delete';
import { ipListCommand } from './ip-list';
import { listCommand } from './list';
import { transferCommand } from './transfer';
import { transferHistoryCommand } from './transfer-history';
import { unblockCommand } from './unblock';

export const subAccountGroup = defineGroup({
  name: 'sub-account',
  description: 'Sub-account management commands',
  commands: [
    listCommand,
    createCommand,
    editCommand,
    deleteCommand,
    blockCommand,
    unblockCommand,
    balanceCommand,
    transferCommand,
    transferHistoryCommand,
    apiKeyListCommand,
    apiKeyCreateCommand,
    apiKeyEditCommand,
    apiKeyResetCommand,
    apiKeyDeleteCommand,
    ipListCommand,
    ipAddCommand,
    ipDeleteCommand,
  ],
});
