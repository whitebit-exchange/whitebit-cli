import { defineGroup } from '@bunli/core';

import { collateralBalanceCommand } from './balance';
import { collateralBalanceSummaryCommand } from './balance-summary';
import { collateralBulkOrderCommand } from './bulk-order';
import { collateralCancelConditionalCommand } from './cancel-conditional';
import { collateralCancelOcoCommand } from './cancel-oco';
import { collateralCancelOtoCommand } from './cancel-oto';
import { collateralClosePositionCommand } from './close-position';
import { collateralConditionalOrdersCommand } from './conditional-orders';
import { collateralCreateOcoCommand } from './create-oco';
import { collateralCreateOtoCommand } from './create-oto';
import { collateralFundingHistoryCommand } from './funding-history';
import { collateralHedgeModeCommand } from './hedge-mode';
import { collateralLimitOrderCommand } from './limit-order';
import { collateralMarketOrderCommand } from './market-order';
import { collateralOcoOrdersCommand } from './oco-orders';
import { collateralOpenPositionsCommand } from './open-positions';
import { collateralPositionHistoryCommand } from './position-history';
import { collateralSetHedgeModeCommand } from './set-hedge-mode';
import { collateralSetLeverageCommand } from './set-leverage';
import { collateralStopLimitCommand } from './stop-limit';
import { collateralSummaryCommand } from './summary';
import { collateralTriggerMarketCommand } from './trigger-market';

export const collateralGroup = defineGroup({
  name: 'collateral',
  description: 'Collateral trading commands',
  commands: [
    collateralBalanceCommand,
    collateralSummaryCommand,
    collateralBalanceSummaryCommand,
    collateralHedgeModeCommand,
    collateralSetHedgeModeCommand,
    collateralLimitOrderCommand,
    collateralMarketOrderCommand,
    collateralBulkOrderCommand,
    collateralStopLimitCommand,
    collateralTriggerMarketCommand,
    collateralSetLeverageCommand,
    collateralClosePositionCommand,
    collateralOpenPositionsCommand,
    collateralPositionHistoryCommand,
    collateralFundingHistoryCommand,
    collateralConditionalOrdersCommand,
    collateralCancelConditionalCommand,
    collateralOcoOrdersCommand,
    collateralCreateOcoCommand,
    collateralCreateOtoCommand,
    collateralCancelOcoCommand,
    collateralCancelOtoCommand,
  ],
});
