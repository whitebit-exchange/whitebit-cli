import { defineGroup } from '@bunli/core';

import { collateralGroup } from '../collateral';
import { convertGroup } from '../convert';
import { tradeAllFeesCommand } from './all-fees';
import { tradeBalanceCommand } from './balance';
import { tradeBulkOrderCommand } from './bulk-order';
import { tradeBuyStockCommand } from './buy-stock';
import { tradeCancelCommand } from './cancel';
import { tradeCancelAllCommand } from './cancel-all';
import { tradeDealsCommand } from './deals';
import { tradeExecutedCommand } from './executed';
import { tradeFeeCommand } from './fee';
import { tradeHistoryCommand } from './history';
import { tradeKillSwitchStatusCommand } from './kill-switch-status';
import { tradeKillSwitchSyncCommand } from './kill-switch-sync';
import { tradeLimitOrderCommand } from './limit-order';
import { tradeMarketOrderCommand } from './market-order';
import { tradeModifyCommand } from './modify';
import { tradeStopLimitCommand } from './stop-limit';
import { tradeStopMarketCommand } from './stop-market';
import { tradeUnexecutedCommand } from './unexecuted';

export const spotGroup = defineGroup({
  name: 'spot',
  description: 'Place and manage spot trading orders, check balances and fees, control kill-switch',
  commands: [
    tradeLimitOrderCommand,
    tradeMarketOrderCommand,
    tradeBulkOrderCommand,
    tradeStopLimitCommand,
    tradeStopMarketCommand,
    tradeBuyStockCommand,
    tradeCancelCommand,
    tradeCancelAllCommand,
    tradeModifyCommand,
    tradeExecutedCommand,
    tradeUnexecutedCommand,
    tradeDealsCommand,
    tradeHistoryCommand,
    tradeBalanceCommand,
    tradeFeeCommand,
    tradeAllFeesCommand,
    tradeKillSwitchStatusCommand,
    tradeKillSwitchSyncCommand,
  ],
});

export const tradeGroup = defineGroup({
  name: 'trade',
  description: 'Trade across spot, collateral markets, and convert between currencies',
  commands: [spotGroup, collateralGroup, convertGroup],
});

export { collateralGroup, convertGroup };
