# Flag-to-Positional Conversion — All Remaining CLI Commands

## TL;DR

> **Quick Summary**: Convert ALL remaining CLI commands from `--flag` syntax to positional `<arg>` syntax using `parseArg()`. When a command has zero remaining flags, remove `option` import and `options: {}` entirely. Update corresponding tests alongside each batch.
>
> **Deliverables**:
> - 51 command files converted (flags→positional for required args)
> - 4 files cleaned up (stale `option` import removed)
> - 13 test files updated to match new handler signatures
> - 1 README.md updated with correct positional syntax
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Batch 0 → Batch 1–7 (parallel by group) → Batch 8 (README)

---

## Context

### Original Request
Convert all remaining CLI commands from `--flag` syntax to positional `<arg>` syntax using `parseArg()` from `src/lib/cli-helpers.ts`. Optional flags stay as flags. When a command has zero remaining flags after conversion, remove the `option` import and empty `options: {}` block.

### Interview Summary
**Key Discussions**:
- Full audit of 50+ files completed — exact conversion targets identified per-file
- User confirmed: remove `option` import + `options: {}` when empty (not keep as convention)
- User confirmed: update tests per batch (not skip or defer)
- User confirmed: keep `--orders` as flag in bulk-order files (JSON is shell-hostile as positional)
- User confirmed: use `z.enum(["true","false"]).transform(v => v === "true")` for boolean positionals

**Research Findings**:
- `parseArg()` exits process on missing/invalid — no try-catch needed in callers
- `z.boolean()` rejects string "true" — MUST use z.enum transform pattern for positional booleans
- `z.number()` rejects string "50000" — MUST use `z.coerce.number()` for positional numbers
- 13 test files call handlers with `{ flags: {...} }` — each must be updated when its command changes
- `completion.ts` only completes subcommand names, not flags — no update needed
- `codes/` group already converted — no action needed

### Metis Review
**Identified Gaps** (addressed):
- Tests breaking CI: → Resolved: update tests per batch
- `--orders` JSON positional: → Resolved: keep as flag
- `z.boolean()` string parsing: → Resolved: use z.enum transform
- Missing codes/ from plan: → Already converted, explicitly excluded
- login.ts, config/ files: → Only optional flags, explicitly excluded

---

## Work Objectives

### Core Objective
Convert required `--flag` arguments to positional `<arg>` syntax across all remaining CLI commands, update corresponding tests, and clean up stale imports.

### Concrete Deliverables
- 51 command files with flags→positional conversion
- 4 files with stale import cleanup
- 13 test files updated
- README.md updated with positional syntax

### Definition of Done
- [ ] `bun run typecheck` passes (exit 0)
- [ ] `bun test` passes (exit 0, excluding 21 pre-existing account API test failures)
- [ ] `bun run lint` passes (exit 0)
- [ ] All converted commands show correct usage on missing arg
- [ ] README reflects positional syntax for all converted commands

### Must Have
- Every required flag converted to positional via `parseArg()`
- `z.coerce.number()` for ALL numeric positional args
- `z.enum(["true","false"]).transform(v => v === "true")` for boolean positional args
- `option` import and `options: {}` removed when no flags remain
- Tests updated alongside each batch

### Must NOT Have (Guardrails)
- Do NOT touch handler business logic or API calls
- Do NOT convert optional flags to positional
- Do NOT touch `completion.ts`, `login.ts`, `config/show.ts`, `config/set.ts`
- Do NOT touch files with only optional flags (cancel-all, executed, unexecuted, history, etc.)
- Do NOT convert `--orders` in bulk-order files (JSON stays as flag)
- Do NOT rename exported variable names
- Do NOT introduce new patterns (no description metadata, no custom usage beyond parseArg)
- Do NOT fix the 21 pre-existing test failures in `test/lib/api/account.test.ts`
- Do NOT fix the 130 pre-existing TS errors in test files

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: YES (tests-after — update tests alongside conversions)
- **Framework**: bun test

### Agent-Executed QA (MANDATORY — ALL tasks)

After EVERY batch:

```bash
bun run typecheck    # Assert: exit code 0
bun test             # Assert: exit code 0 (excluding 21 pre-existing failures)
bun run lint         # Assert: exit code 0
```

Per converted command:
```bash
bun run src/cli.ts <command-path>
# Assert: prints "Error: Missing required argument: <ARG_NAME>" and "Usage: whitebit ..."
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 0: Cleanup stale imports (4 files, no deps)

Wave 2 (After Wave 1):
├── Task 1: balance/main-balance.ts (1 file + 1 test)
├── Task 2: earn group (6 files, no tests)
├── Task 3: market group (4 files + 2 tests)
└── Task 7: convert group (2 files + 2 tests)

Wave 3 (After Wave 2):
├── Task 4: trade/spot (11 files + 3 tests)
├── Task 5: collateral (13 files + 1 test)
└── Task 6: sub-account (15 files + 2 tests)

Wave 4 (After Wave 3):
└── Task 8: README update (1 file)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 0 | None | 1–7 | None (quick, do first) |
| 1 | 0 | 8 | 2, 3, 7 |
| 2 | 0 | 8 | 1, 3, 7 |
| 3 | 0 | 8 | 1, 2, 7 |
| 4 | 0 | 8 | 5, 6 |
| 5 | 0 | 8 | 4, 6 |
| 6 | 0 | 8 | 4, 5 |
| 7 | 0 | 8 | 1, 2, 3 |
| 8 | 1–7 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended |
|------|-------|-------------|
| 1 | 0 | quick, sequential |
| 2 | 1, 2, 3, 7 | parallel, category=quick |
| 3 | 4, 5, 6 | parallel, category=unspecified-high |
| 4 | 8 | quick, sequential |

---

## File Disposition Manifest

> Every file that imports `option` is listed. Nothing is unaccounted for.

### CONVERT (51 files) — flags→positional conversion needed

| File | Required→Positional | Remaining Flags | Remove option import? |
|------|---------------------|----------------|-----------------------|
| `balance/main-balance.ts` | `--ticker` → optional `[asset]` | none | YES |
| `earn/fixed/invest.ts` | `--planId --amount` | none | YES |
| `earn/fixed/close-investment.ts` | `--id` | none | YES |
| `earn/flex/flex-invest.ts` | `--planId --amount` | none | YES |
| `earn/flex/flex-withdraw.ts` | `--id --amount` | none | YES |
| `earn/flex/flex-close.ts` | `--id` | none | YES |
| `earn/flex/flex-auto-reinvest.ts` | `--id --enabled` | none | YES |
| `market/depth.ts` | `--market` | `--limit` | NO |
| `market/trades.ts` | `--market` | `--type` | NO |
| `market/kline.ts` | `--market --interval` | `--start --end --limit` | NO |
| `market/funding-history.ts` | `--market` | `--limit --offset` | NO |
| `trade/limit-order.ts` | `--market --side --amount --price` | `--clientOrderId --postOnly` | NO |
| `trade/market-order.ts` | `--market --side --amount` | `--clientOrderId` | NO |
| `trade/stop-limit.ts` | `--market --side --amount --price --activationPrice` | `--clientOrderId` | NO |
| `trade/stop-market.ts` | `--market --side --amount --activationPrice` | `--clientOrderId` | NO |
| `trade/buy-stock.ts` | `--market --amount` | `--clientOrderId` | NO |
| `trade/bulk-order.ts` | `--market` | `--orders` (JSON, stays flag) | NO |
| `trade/cancel.ts` | `--market --orderId` | none | YES |
| `trade/modify.ts` | `--market --orderId` | `--price --amount` | NO |
| `trade/fee.ts` | `--market` | none | YES |
| `trade/kill-switch-sync.ts` | `--market --timeout` | none | YES |
| `trade/deals.ts` | `--orderId` | `--limit --offset` | NO |
| `collateral/limit-order.ts` | `--market --side --amount --price` | `--leverage --clientOrderId --postOnly --ioc` | NO |
| `collateral/market-order.ts` | `--market --side --amount` | `--leverage --clientOrderId` | NO |
| `collateral/stop-limit.ts` | `--market --side --amount --price --activationPrice` | `--leverage --clientOrderId` | NO |
| `collateral/trigger-market.ts` | `--market --side --amount --activationPrice` | `--leverage --clientOrderId` | NO |
| `collateral/bulk-order.ts` | `--market` | `--orders` (JSON, stays flag) | NO |
| `collateral/set-leverage.ts` | `--market --leverage` | none | YES |
| `collateral/close-position.ts` | `--market` | `--positionId` | NO |
| `collateral/cancel-conditional.ts` | `--market --orderId` | none | YES |
| `collateral/cancel-oco.ts` | `--market --orderId` | none | YES |
| `collateral/cancel-oto.ts` | `--market --orderId` | none | YES |
| `collateral/create-oco.ts` | `--market --side --amount --price --stopPrice` | `--leverage --clientOrderId` | NO |
| `collateral/create-oto.ts` | `--market --side --amount --price --triggerPrice` | `--leverage --clientOrderId` | NO |
| `collateral/set-hedge-mode.ts` | `--enabled` | none | YES |
| `sub-account/create.ts` | `--alias` | none | YES |
| `sub-account/delete.ts` | `--id` | none | YES |
| `sub-account/balance.ts` | `--id` | none | YES |
| `sub-account/block.ts` | `--id` | none | YES |
| `sub-account/unblock.ts` | `--id` | none | YES |
| `sub-account/edit.ts` | `--id --alias` | none | YES |
| `sub-account/transfer.ts` | `--ticker --amount` | `--fromId --toId` | NO |
| `sub-account/api-key-create.ts` | `--subAccountId --label --permissions` | none | YES |
| `sub-account/api-key-delete.ts` | `--subAccountId --apiKeyId` | none | YES |
| `sub-account/api-key-edit.ts` | `--subAccountId --apiKeyId` | `--label --permissions` | NO |
| `sub-account/api-key-list.ts` | `--subAccountId` | none | YES |
| `sub-account/api-key-reset.ts` | `--subAccountId --apiKeyId` | none | YES |
| `sub-account/ip-add.ts` | `--subAccountId --apiKeyId --ip` | none | YES |
| `sub-account/ip-delete.ts` | `--subAccountId --apiKeyId --ip` | none | YES |
| `sub-account/ip-list.ts` | `--subAccountId --apiKeyId` | none | YES |
| `convert/estimate.ts` | `--from --to --amount` | none | YES |
| `convert/confirm.ts` | `--estimateId` | none | YES |

### CLEANUP_ONLY (4 files) — remove stale option import + options: {}

| File | Why |
|------|-----|
| `deposit/deposit-refund.ts` | Already converted, stale import remains |
| `deposit/fiat-deposit-address.ts` | Already converted, stale import remains |
| `transfer/transfer.ts` | Already converted, stale import remains |
| `withdraw/withdraw-fiat.ts` | Already converted, stale import remains |

### ALREADY_DONE (7 files) — fully converted, no action needed

| File | Status |
|------|--------|
| `balance/balance.ts` | Canonical pattern — optional positional |
| `deposit/deposit-address.ts` | Canonical pattern — positional + flags mix |
| `deposit/create-address.ts` | Already uses parseArg |
| `withdraw/withdraw-crypto.ts` | Already uses parseArg + keeps --network/--memo |
| `withdraw/withdraw-crypto-amount.ts` | Already uses parseArg + keeps --network |
| `codes/apply-code.ts` | Already uses parseArg + keeps --passphrase |
| `codes/create-code.ts` | Already uses parseArg + keeps --passphrase/--description |

### NO_ACTION_NEEDED — only optional flags or no flags

| File | Reason |
|------|--------|
| `trade/cancel-all.ts` | Only `--market` optional |
| `trade/executed.ts` | All optional flags |
| `trade/unexecuted.ts` | All optional flags |
| `trade/history.ts` | All optional flags |
| `trade/balance.ts` | All optional flags |
| `trade/all-fees.ts` | No flags |
| `trade/kill-switch-status.ts` | All optional flags |
| `collateral/balance.ts` | All optional flags |
| `collateral/summary.ts` | All optional flags |
| `collateral/balance-summary.ts` | All optional flags |
| `collateral/hedge-mode.ts` | No flags |
| `collateral/open-positions.ts` | All optional flags |
| `collateral/conditional-orders.ts` | All optional flags |
| `collateral/oco-orders.ts` | All optional flags |
| `collateral/position-history.ts` | All optional flags |
| `collateral/funding-history.ts` | All optional flags |
| `sub-account/list.ts` | All optional flags |
| `sub-account/transfer-history.ts` | All optional flags |
| `codes/my-codes.ts` | All optional flags |
| `codes/codes-history.ts` | All optional flags |
| `convert/history.ts` | All optional flags |
| `market/list.ts` | No required flags |
| `market/tickers.ts` | No required flags |
| `market/ticker.ts` | Already positional |
| `market/asset-status.ts` | Already positional |
| `market/status.ts` | Already positional |
| `market/activity.ts` | Already positional |
| `withdraw/withdraw-history.ts` | All optional flags |
| `login.ts` | All optional flags |
| `config/show.ts` | All optional flags |
| `config/set.ts` | All optional flags |
| `completion.ts` | Only `--shell` optional |
| `balance/fee.ts` | No flags |
| `earn/fixed/plans.ts` | No flags |
| `earn/fixed/investments-history.ts` | All optional flags |
| `earn/flex/plans.ts` | No flags |
| `earn/flex/investments.ts` | No flags |
| `earn/flex/investment-history.ts` | All optional flags |
| `earn/flex/payment-history.ts` | All optional flags |
| `earn/interest-history.ts` | All optional flags |

---

## Test File Impact Matrix

> Tests that call handlers with `{ flags: {...} }` for commands being converted.

| Test File | Command(s) Tested | What Breaks | Update In |
|-----------|-------------------|-------------|-----------|
| `test/commands/account/main-balance.test.ts` | `balance/main-balance.ts` | `flags.ticker` → `positional[0]` | Task 1 |
| `test/commands/market/depth.test.ts` | `market/depth.ts` | `flags.market` → `positional[0]` | Task 3 |
| `test/commands/market/kline.test.ts` | `market/kline.ts` | `flags.market, flags.interval` → `positional[0], positional[1]` | Task 3 |
| `test/commands/trade/limit-order.test.ts` | `trade/limit-order.ts` | `flags.market/side/amount/price` → `positional[0-3]` | Task 4 |
| `test/commands/trade/cancel.test.ts` | `trade/cancel.ts` | `flags.market/orderId` → `positional[0-1]` | Task 4 |
| `test/commands/collateral/limit-order.test.ts` | `collateral/limit-order.ts` | `flags.market/side/amount/price` → `positional[0-3]` | Task 5 |
| `test/commands/sub-account/create.test.ts` | `sub-account/create.ts` | `flags.alias` → `positional[0]` | Task 6 |
| `test/commands/sub-account/transfer.test.ts` | `sub-account/transfer.ts` | `flags.ticker/amount` → `positional[0-1]` | Task 6 |
| `test/commands/convert/estimate.test.ts` | `convert/estimate.ts` | `flags.from/to/amount` → `positional[0-2]` | Task 7 |
| `test/commands/convert/confirm.test.ts` | `convert/confirm.ts` | `flags.estimateId` → `positional[0]` | Task 7 |

**Tests NOT affected** (their commands aren't being converted):
- `test/commands/trade/unexecuted.test.ts` — all optional flags
- `test/commands/market/tickers.test.ts` — no required flags
- `test/commands/sub-account/list.test.ts` — all optional flags
- `test/commands/collateral/balance.test.ts` — all optional flags
- `test/commands/collateral/open-positions.test.ts` — all optional flags
- `test/commands/account/withdraw-crypto.test.ts` — already converted
- `test/commands/account/transfer.test.ts` — already converted
- `test/commands/trade/nesting.test.ts` — structure test
- `test/commands/groups/nesting.test.ts` — structure test
- `test/commands/completion.test.ts` — not converting
- `test/commands/login-ui.test.ts` — not converting

---

## TODOs

### Task 0: Cleanup Stale Imports (4 files)

**What to do**:
- Remove `option` from the `import { defineCommand, option } from '@bunli/core'` line (change to `import { defineCommand } from '@bunli/core'`)
- Remove the empty `options: {},` line
- Files: `deposit/deposit-refund.ts`, `deposit/fiat-deposit-address.ts`, `transfer/transfer.ts`, `withdraw/withdraw-fiat.ts`

**Must NOT do**:
- Do NOT touch parseArg calls, handler logic, or anything else
- Do NOT remove the `z` import (may still be used by parseArg schemas)

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: [`git-master`]
  - `git-master`: commit changes after cleanup

**Parallelization**:
- **Can Run In Parallel**: NO (quick task, do first)
- **Parallel Group**: Wave 1 (solo)
- **Blocks**: Tasks 1–7
- **Blocked By**: None

**References**:

**Pattern References**:
- `src/commands/balance/balance.ts:1` — Example of clean import without `option` (just `import { defineCommand } from '@bunli/core'`)

**Files to Modify**:
- `src/commands/deposit/deposit-refund.ts:1,13` — line 1: remove `option` from import; line 13: remove `options: {},`
- `src/commands/deposit/fiat-deposit-address.ts` — same pattern: remove `option` from import, remove `options: {},`
- `src/commands/transfer/transfer.ts` — same pattern
- `src/commands/withdraw/withdraw-fiat.ts` — same pattern

**Acceptance Criteria**:

```
Scenario: Stale option imports removed from all 4 files
  Tool: Bash (grep)
  Preconditions: None
  Steps:
    1. grep -c "import.*option.*from.*@bunli/core" src/commands/deposit/deposit-refund.ts src/commands/deposit/fiat-deposit-address.ts src/commands/transfer/transfer.ts src/commands/withdraw/withdraw-fiat.ts
    2. Assert: all 4 files show count 0 (no `option` in import)
    3. grep -c "options:" src/commands/deposit/deposit-refund.ts src/commands/deposit/fiat-deposit-address.ts src/commands/transfer/transfer.ts src/commands/withdraw/withdraw-fiat.ts
    4. Assert: all 4 files show count 0 (no options block)
    5. bun run typecheck
    6. Assert: exit code 0
    7. bun test
    8. Assert: exit code 0
  Expected Result: All 4 files compile cleanly without stale imports
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(cli): remove stale option imports from already-converted commands`
- Files: `src/commands/deposit/deposit-refund.ts`, `src/commands/deposit/fiat-deposit-address.ts`, `src/commands/transfer/transfer.ts`, `src/commands/withdraw/withdraw-fiat.ts`
- Pre-commit: `bun run typecheck && bun test`

---

### Task 1: balance/main-balance.ts — Optional Positional + Table Normalization (1 file + 1 test)

**What to do**:
- Convert `--ticker` (optional) to optional positional `[asset]`
- Read `positional[0]` instead of `flags.ticker`
- Add table normalization: when single-asset API response returns flat object, wrap in `{ [ticker.toUpperCase()]: response }` before `recordToRows()` (same pattern as `balance/balance.ts:23-26`)
- Remove `option` import and `options: {}` entirely (no flags remain)
- Update `test/commands/account/main-balance.test.ts`: change `flags: { ticker: 'BTC' }` to `positional: ['BTC'], flags: {}`

**Must NOT do**:
- Do NOT change API endpoint or request body construction
- Do NOT change formatOutput logic beyond adding table normalization

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: [`git-master`]

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 2, 3, 7)
- **Blocks**: Task 8
- **Blocked By**: Task 0

**References**:

**Pattern References**:
- `src/commands/balance/balance.ts:11-30` — CANONICAL: optional positional + single-asset table normalization. Copy this exact pattern.
- `src/commands/market/helpers.ts` — `recordToRows()` function used for table normalization

**Files to Modify**:
- `src/commands/balance/main-balance.ts` — convert `--ticker` to optional positional, add table normalization
- `test/commands/account/main-balance.test.ts` — update handler calls: `flags: { ticker: 'BTC' }` → `positional: ['BTC'], flags: {}`

**Test Update Detail**:
The test at `test/commands/account/main-balance.test.ts` calls the handler at lines 45, 71, 89. Each must change from:
```ts
// OLD
{ flags: { ticker: 'BTC' } }
// NEW
{ positional: ['BTC'], flags: {} }
```
For empty ticker calls: `{ flags: {} }` → `{ positional: [], flags: {} }`

**Acceptance Criteria**:

```
Scenario: main-balance with optional asset positional
  Tool: Bash
  Steps:
    1. grep -c "option" src/commands/balance/main-balance.ts
    2. Assert: 0 (no option import or options block)
    3. grep "positional\[0\]" src/commands/balance/main-balance.ts
    4. Assert: match found (reads from positional)
    5. bun run typecheck
    6. Assert: exit code 0
    7. bun test test/commands/account/main-balance.test.ts
    8. Assert: exit code 0, all tests pass
  Expected Result: main-balance uses optional positional, tests pass
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(balance): convert main-balance --ticker to optional positional [asset]`
- Files: `src/commands/balance/main-balance.ts`, `test/commands/account/main-balance.test.ts`
- Pre-commit: `bun run typecheck && bun test`

---

### Task 2: earn Group (6 files, no tests)

**What to do**:

For each file, convert required flags to positional args using `parseArg()`, remove `option` import and `options: {}` (all earn files become fully positional with no remaining flags).

**File-by-file conversion spec**:

1. **`earn/fixed/invest.ts`** — `--planId --amount` → `<plan_id> <amount>`
   - `positional[0]` → `parseArg(positional[0], z.string().min(1), 'PLAN_ID', 'whitebit earn fixed invest <plan_id> <amount>')`
   - `positional[1]` → `parseArg(positional[1], z.string().min(1), 'AMOUNT', 'whitebit earn fixed invest <plan_id> <amount>')`
   - Remove `option` import, remove `options: {}`

2. **`earn/fixed/close-investment.ts`** — `--id` → `<id>`
   - `positional[0]` → `parseArg(positional[0], z.coerce.number().int().positive(), 'ID', 'whitebit earn fixed close-investment <id>')`
   - Remove `option` import, remove `options: {}`

3. **`earn/flex/flex-invest.ts`** — `--planId --amount` → `<plan_id> <amount>`
   - `positional[0]` → `parseArg(positional[0], z.string().min(1), 'PLAN_ID', 'whitebit earn flex invest <plan_id> <amount>')`
   - `positional[1]` → `parseArg(positional[1], z.string().min(1), 'AMOUNT', 'whitebit earn flex invest <plan_id> <amount>')`
   - Remove `option` import, remove `options: {}`

4. **`earn/flex/flex-withdraw.ts`** — `--id --amount` → `<id> <amount>`
   - `positional[0]` → `parseArg(positional[0], z.coerce.number().int().positive(), 'ID', 'whitebit earn flex withdraw <id> <amount>')`
   - `positional[1]` → `parseArg(positional[1], z.string().min(1), 'AMOUNT', 'whitebit earn flex withdraw <id> <amount>')`
   - Remove `option` import, remove `options: {}`

5. **`earn/flex/flex-close.ts`** — `--id` → `<id>`
   - `positional[0]` → `parseArg(positional[0], z.coerce.number().int().positive(), 'ID', 'whitebit earn flex close <id>')`
   - Remove `option` import, remove `options: {}`

6. **`earn/flex/flex-auto-reinvest.ts`** — `--id --enabled` → `<id> <enabled>`
   - `positional[0]` → `parseArg(positional[0], z.coerce.number().int().positive(), 'ID', 'whitebit earn flex auto-reinvest <id> <enabled>')`
   - `positional[1]` → `parseArg(positional[1], z.enum(["true", "false"]).transform(v => v === "true"), 'ENABLED', 'whitebit earn flex auto-reinvest <id> <enabled>')`
   - NOTE: Current file uses `z.coerce.boolean()` — change to `z.enum` transform for positional
   - Remove `option` import, remove `options: {}`

**Must NOT do**:
- Do NOT change API call bodies or handler logic
- Do NOT add new schemas beyond what the original flags had (just change from option() to parseArg())

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: [`git-master`]

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 1, 3, 7)
- **Blocks**: Task 8
- **Blocked By**: Task 0

**References**:

**Pattern References**:
- `src/commands/deposit/deposit-refund.ts:10-40` — CANONICAL: all-required → positional, remove options. Follow this exact structure (after Task 0 cleanup).
- `src/lib/cli-helpers.ts:3-22` — `parseArg()` signature and behavior

**API/Type References**:
- `src/lib/api/account.ts` — AccountApi methods called by earn commands

**Files to Modify**:
- `src/commands/earn/fixed/invest.ts`
- `src/commands/earn/fixed/close-investment.ts`
- `src/commands/earn/flex/flex-invest.ts`
- `src/commands/earn/flex/flex-withdraw.ts`
- `src/commands/earn/flex/flex-close.ts`
- `src/commands/earn/flex/flex-auto-reinvest.ts`

**Tests**: No existing test files for earn commands.

**Acceptance Criteria**:

```
Scenario: All 6 earn files converted, no option imports remain
  Tool: Bash
  Steps:
    1. grep -rl "import.*option.*from.*@bunli/core" src/commands/earn/
    2. Assert: no output (no files import option)
    3. grep -rl "options:" src/commands/earn/fixed/invest.ts src/commands/earn/fixed/close-investment.ts src/commands/earn/flex/flex-invest.ts src/commands/earn/flex/flex-withdraw.ts src/commands/earn/flex/flex-close.ts src/commands/earn/flex/flex-auto-reinvest.ts
    4. Assert: no output (no options blocks)
    5. grep -l "parseArg" src/commands/earn/fixed/invest.ts src/commands/earn/fixed/close-investment.ts src/commands/earn/flex/flex-invest.ts src/commands/earn/flex/flex-withdraw.ts src/commands/earn/flex/flex-close.ts src/commands/earn/flex/flex-auto-reinvest.ts
    6. Assert: all 6 files listed (parseArg used in each)
    7. bun run typecheck
    8. Assert: exit code 0
    9. bun test
    10. Assert: exit code 0
  Expected Result: All earn commands use positional args
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(earn): convert all earn command flags to positional args`
- Files: all 6 earn files listed above
- Pre-commit: `bun run typecheck && bun test`

---

### Task 3: market Group (4 files + 2 tests)

**What to do**:

Convert required `--market` (and `--interval` for kline) to positional. Keep optional flags (`--limit`, `--type`, `--start`, `--end`, `--offset`). Keep `option` import since optional flags remain.

**File-by-file conversion spec**:

1. **`market/depth.ts`** — `--market` → `<pair>`, keep `--limit`
   - `positional[0]` → `parseArg(positional[0], z.string().min(1), 'PAIR', 'whitebit market depth <pair>')`
   - Remove `market` from options block, keep `limit`
   - Handler: `flags.market` → use parsed positional

2. **`market/trades.ts`** — `--market` → `<pair>`, keep `--type`
   - `positional[0]` → `parseArg(positional[0], z.string().min(1), 'PAIR', 'whitebit market trades <pair>')`
   - Remove `market` from options block, keep `type`

3. **`market/kline.ts`** — `--market --interval` → `<pair> <interval>`, keep `--start --end --limit`
   - `positional[0]` → `parseArg(positional[0], z.string().min(1), 'PAIR', 'whitebit market kline <pair> <interval>')`
   - `positional[1]` → `parseArg(positional[1], z.string().min(1), 'INTERVAL', 'whitebit market kline <pair> <interval>')`
   - Remove `market` and `interval` from options block, keep `start`, `end`, `limit`

4. **`market/funding-history.ts`** — `--market` → `<pair>`, keep `--limit --offset`
   - `positional[0]` → `parseArg(positional[0], z.string().min(1), 'PAIR', 'whitebit market funding-history <pair>')`
   - Remove `market` from options block, keep `limit`, `offset`

**Must NOT do**:
- Do NOT remove `option` import (optional flags still use it)
- Do NOT change API endpoints or response handling

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: [`git-master`]

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 1, 2, 7)
- **Blocks**: Task 8
- **Blocked By**: Task 0

**References**:

**Pattern References**:
- `src/commands/deposit/deposit-address.ts:10-49` — CANONICAL: positional + remaining flags mix. Follow this exact structure.
- `src/lib/cli-helpers.ts:3-22` — `parseArg()` signature

**Files to Modify**:
- `src/commands/market/depth.ts`
- `src/commands/market/trades.ts`
- `src/commands/market/kline.ts`
- `src/commands/market/funding-history.ts`
- `test/commands/market/depth.test.ts`
- `test/commands/market/kline.test.ts`

**Test Update Detail**:

`test/commands/market/depth.test.ts`:
- Line 56: `{ flags: { market: 'BTC_USDT' } }` → `{ positional: ['BTC_USDT'], flags: {} }`
- Line 90: `{ flags: { market: 'BTC_USDT', limit: 1 } }` → `{ positional: ['BTC_USDT'], flags: { limit: 1 } }`

`test/commands/market/kline.test.ts`:
- Line 56: `{ flags: { market: 'BTC_USDT', interval: '1h' } }` → `{ positional: ['BTC_USDT', '1h'], flags: {} }`
- Line 95: `{ flags: { market: 'BTC_USDT', interval: '1h', start: ..., end: ..., limit: 100 } }` → `{ positional: ['BTC_USDT', '1h'], flags: { start: ..., end: ..., limit: 100 } }`

**Acceptance Criteria**:

```
Scenario: Market commands use positional pair, keep optional flags
  Tool: Bash
  Steps:
    1. grep "parseArg" src/commands/market/depth.ts src/commands/market/trades.ts src/commands/market/kline.ts src/commands/market/funding-history.ts
    2. Assert: all 4 files contain parseArg calls
    3. grep "options:" src/commands/market/depth.ts
    4. Assert: match found (options block still exists for --limit)
    5. bun run typecheck
    6. Assert: exit code 0
    7. bun test test/commands/market/depth.test.ts test/commands/market/kline.test.ts
    8. Assert: exit code 0, all tests pass
    9. bun test
    10. Assert: exit code 0
  Expected Result: Market commands use positional for required args, optional flags preserved
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(market): convert required market flags to positional args`
- Files: 4 command files + 2 test files
- Pre-commit: `bun run typecheck && bun test`

---

### Task 4: trade/spot Group (11 files + 3 tests)

**What to do**:

Convert required flags to positional for all 11 trade/spot commands. Keep optional flags where specified. Update 3 test files.

**File-by-file conversion spec**:

1. **`trade/limit-order.ts`** — `--market --side --amount --price` → `<pair> <side> <amount> <price>`, keep `--clientOrderId --postOnly`
   - positional[0] → pair (z.string), positional[1] → side (z.string), positional[2] → amount (z.string), positional[3] → price (z.string)
   - Usage: `'whitebit trade spot limit-order <pair> <side> <amount> <price>'`

2. **`trade/market-order.ts`** — `--market --side --amount` → `<pair> <side> <amount>`, keep `--clientOrderId`

3. **`trade/stop-limit.ts`** — `--market --side --amount --price --activationPrice` → `<pair> <side> <amount> <price> <activation_price>`, keep `--clientOrderId`

4. **`trade/stop-market.ts`** — `--market --side --amount --activationPrice` → `<pair> <side> <amount> <activation_price>`, keep `--clientOrderId`

5. **`trade/buy-stock.ts`** — `--market --amount` → `<pair> <amount>`, keep `--clientOrderId`

6. **`trade/bulk-order.ts`** — `--market` → `<pair>`, keep `--orders` as flag (JSON)
   - ONLY `--market` becomes positional. `--orders` stays as flag.
   - Keep `option` import for `--orders`

7. **`trade/cancel.ts`** — `--market --orderId` → `<pair> <order_id>`, remove options
   - positional[1] → `parseArg(positional[1], z.coerce.number().int().positive(), 'ORDER_ID', ...)`
   - NOTE: original uses `z.number()` — MUST change to `z.coerce.number()` for positional

8. **`trade/modify.ts`** — `--market --orderId` → `<pair> <order_id>`, keep `--price --amount`
   - positional[1] → `z.coerce.number()` for orderId

9. **`trade/fee.ts`** — `--market` → `<pair>`, remove options

10. **`trade/kill-switch-sync.ts`** — `--market --timeout` → `<pair> <timeout>`, remove options
    - positional[1] → `z.coerce.number()` for timeout

11. **`trade/deals.ts`** — `--orderId` → `<order_id>`, keep `--limit --offset`
    - positional[0] → `z.coerce.number()` for orderId

**Must NOT do**:
- Do NOT convert `--orders` to positional in bulk-order.ts (JSON stays as flag)
- Do NOT change order validation logic in bulk-order handler
- Do NOT touch `cancel-all.ts`, `executed.ts`, `unexecuted.ts`, `history.ts`, `balance.ts`, `all-fees.ts`, `kill-switch-status.ts`

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
- **Skills**: [`git-master`]
  - `git-master`: commit after all 11 files + tests updated

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 5, 6)
- **Blocks**: Task 8
- **Blocked By**: Task 0

**References**:

**Pattern References**:
- `src/commands/deposit/deposit-address.ts:10-49` — positional + remaining flags mix
- `src/commands/deposit/deposit-refund.ts` — all-required, remove options (after Task 0 cleanup)
- `src/lib/cli-helpers.ts:3-22` — parseArg signature

**Files to Modify**:
- `src/commands/trade/limit-order.ts`
- `src/commands/trade/market-order.ts`
- `src/commands/trade/stop-limit.ts`
- `src/commands/trade/stop-market.ts`
- `src/commands/trade/buy-stock.ts`
- `src/commands/trade/bulk-order.ts`
- `src/commands/trade/cancel.ts`
- `src/commands/trade/modify.ts`
- `src/commands/trade/fee.ts`
- `src/commands/trade/kill-switch-sync.ts`
- `src/commands/trade/deals.ts`
- `test/commands/trade/limit-order.test.ts`
- `test/commands/trade/cancel.test.ts`

**Test Update Detail**:

`test/commands/trade/limit-order.test.ts`:
- Lines 56-63: `{ flags: { market: 'BTC_USDT', side: 'buy', amount: '0.01', price: '50000' } }` → `{ positional: ['BTC_USDT', 'buy', '0.01', '50000'], flags: {} }`
- Lines 77-84: same transformation

`test/commands/trade/cancel.test.ts`:
- Lines 56-61: `{ flags: { market: 'BTC_USDT', orderId: 123456 } }` → `{ positional: ['BTC_USDT', '123456'], flags: {} }`
- Lines 75-80: `{ flags: { market: 'BTC_USDT', orderId: 999999 } }` → `{ positional: ['BTC_USDT', '999999'], flags: {} }`

**Note on `test/commands/trade/unexecuted.test.ts`**: This test calls the unexecuted command which is NOT being converted (all optional flags). No changes needed.

**Acceptance Criteria**:

```
Scenario: All 11 trade/spot files converted, tests pass
  Tool: Bash
  Steps:
    1. grep -l "parseArg" src/commands/trade/limit-order.ts src/commands/trade/cancel.ts src/commands/trade/fee.ts src/commands/trade/kill-switch-sync.ts src/commands/trade/deals.ts
    2. Assert: all 5 files listed
    3. grep "options:" src/commands/trade/cancel.ts
    4. Assert: no match (options block removed — all required)
    5. grep "options:" src/commands/trade/bulk-order.ts
    6. Assert: match found (--orders remains as flag)
    7. bun run typecheck
    8. Assert: exit code 0
    9. bun test test/commands/trade/limit-order.test.ts test/commands/trade/cancel.test.ts
    10. Assert: exit code 0, all tests pass
    11. bun test
    12. Assert: exit code 0
  Expected Result: All trade/spot commands converted, tests green
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(trade): convert spot trading command flags to positional args`
- Files: 11 command files + 2 test files
- Pre-commit: `bun run typecheck && bun test`

---

### Task 5: collateral Group (13 files + 1 test)

**What to do**:

Convert required flags to positional for all 13 collateral commands. Keep optional flags where specified.

**File-by-file conversion spec**:

1. **`collateral/limit-order.ts`** — `--market --side --amount --price` → `<pair> <side> <amount> <price>`, keep `--leverage --clientOrderId --postOnly --ioc`

2. **`collateral/market-order.ts`** — `--market --side --amount` → `<pair> <side> <amount>`, keep `--leverage --clientOrderId`

3. **`collateral/stop-limit.ts`** — `--market --side --amount --price --activationPrice` → `<pair> <side> <amount> <price> <activation_price>`, keep `--leverage --clientOrderId`

4. **`collateral/trigger-market.ts`** — `--market --side --amount --activationPrice` → `<pair> <side> <amount> <activation_price>`, keep `--leverage --clientOrderId`

5. **`collateral/bulk-order.ts`** — `--market` → `<pair>`, keep `--orders` as flag (JSON)

6. **`collateral/set-leverage.ts`** — `--market --leverage` → `<pair> <leverage>`, remove options
   - positional[1] → `z.coerce.number()` for leverage

7. **`collateral/close-position.ts`** — `--market` → `<pair>`, keep `--positionId`

8. **`collateral/cancel-conditional.ts`** — `--market --orderId` → `<pair> <order_id>`, remove options
   - positional[1] → `z.coerce.number()` for orderId

9. **`collateral/cancel-oco.ts`** — `--market --orderId` → `<pair> <order_id>`, remove options
   - positional[1] → `z.coerce.number()` for orderId

10. **`collateral/cancel-oto.ts`** — `--market --orderId` → `<pair> <order_id>`, remove options
    - positional[1] → `z.coerce.number()` for orderId

11. **`collateral/create-oco.ts`** — `--market --side --amount --price --stopPrice` → `<pair> <side> <amount> <price> <stop_price>`, keep `--leverage --clientOrderId`

12. **`collateral/create-oto.ts`** — `--market --side --amount --price --triggerPrice` → `<pair> <side> <amount> <price> <trigger_price>`, keep `--leverage --clientOrderId`

13. **`collateral/set-hedge-mode.ts`** — `--enabled` → `<enabled>`, remove options
    - `positional[0]` → `parseArg(positional[0], z.enum(["true", "false"]).transform(v => v === "true"), 'ENABLED', 'whitebit trade collateral set-hedge-mode <enabled>')`
    - NOTE: Original uses `z.boolean()` — MUST change to z.enum transform

**Must NOT do**:
- Do NOT convert `--orders` to positional in bulk-order.ts
- Do NOT touch `balance.ts`, `summary.ts`, `balance-summary.ts`, `hedge-mode.ts`, `open-positions.ts`, `conditional-orders.ts`, `oco-orders.ts`, `position-history.ts`, `funding-history.ts`

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
- **Skills**: [`git-master`]

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 4, 6)
- **Blocks**: Task 8
- **Blocked By**: Task 0

**References**:

**Pattern References**:
- `src/commands/deposit/deposit-address.ts:10-49` — positional + remaining flags mix
- `src/commands/deposit/deposit-refund.ts` — all-required, remove options
- `src/lib/cli-helpers.ts:3-22` — parseArg signature

**Files to Modify**:
- `src/commands/collateral/limit-order.ts`
- `src/commands/collateral/market-order.ts`
- `src/commands/collateral/stop-limit.ts`
- `src/commands/collateral/trigger-market.ts`
- `src/commands/collateral/bulk-order.ts`
- `src/commands/collateral/set-leverage.ts`
- `src/commands/collateral/close-position.ts`
- `src/commands/collateral/cancel-conditional.ts`
- `src/commands/collateral/cancel-oco.ts`
- `src/commands/collateral/cancel-oto.ts`
- `src/commands/collateral/create-oco.ts`
- `src/commands/collateral/create-oto.ts`
- `src/commands/collateral/set-hedge-mode.ts`
- `test/commands/collateral/limit-order.test.ts`

**Test Update Detail**:

`test/commands/collateral/limit-order.test.ts`:
- Lines with `flags: { market: ..., side: ..., amount: ..., price: ... }` → `positional: ['BTC_USDT', 'buy', '0.01', '50000'], flags: { leverage: ..., ... }`
- Keep optional flag values in `flags` object, move required args to `positional` array

**Acceptance Criteria**:

```
Scenario: All 13 collateral files converted, test passes
  Tool: Bash
  Steps:
    1. grep -l "parseArg" src/commands/collateral/limit-order.ts src/commands/collateral/set-leverage.ts src/commands/collateral/set-hedge-mode.ts src/commands/collateral/cancel-conditional.ts
    2. Assert: all 4 files listed (spot check)
    3. grep "z.enum" src/commands/collateral/set-hedge-mode.ts
    4. Assert: match found (boolean uses z.enum transform)
    5. grep "z.coerce.number" src/commands/collateral/cancel-conditional.ts
    6. Assert: match found (orderId uses z.coerce.number)
    7. bun run typecheck
    8. Assert: exit code 0
    9. bun test test/commands/collateral/limit-order.test.ts
    10. Assert: exit code 0
    11. bun test
    12. Assert: exit code 0
  Expected Result: All collateral commands converted, tests green
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(collateral): convert collateral command flags to positional args`
- Files: 13 command files + 1 test file
- Pre-commit: `bun run typecheck && bun test`

---

### Task 6: sub-account Group (15 files + 2 tests)

**What to do**:

Convert required flags to positional for all 15 sub-account commands. Most become fully positional with `option` import removed.

**File-by-file conversion spec**:

1. **`sub-account/create.ts`** — `--alias` → `<alias>`, remove options

2. **`sub-account/delete.ts`** — `--id` → `<id>`, remove options

3. **`sub-account/balance.ts`** — `--id` → `<id>`, remove options

4. **`sub-account/block.ts`** — `--id` → `<id>`, remove options

5. **`sub-account/unblock.ts`** — `--id` → `<id>`, remove options

6. **`sub-account/edit.ts`** — `--id --alias` → `<id> <alias>`, remove options

7. **`sub-account/transfer.ts`** — `--ticker --amount` → `<asset> <amount>`, keep `--fromId --toId` as optional flags
   - positional[0] → ticker (z.string), positional[1] → amount (z.string)
   - Keep `option` import for `--fromId`, `--toId`

8. **`sub-account/api-key-create.ts`** — `--subAccountId --label --permissions` → `<sub_account_id> <label> <permissions>`, remove options

9. **`sub-account/api-key-delete.ts`** — `--subAccountId --apiKeyId` → `<sub_account_id> <api_key_id>`, remove options

10. **`sub-account/api-key-edit.ts`** — `--subAccountId --apiKeyId` → `<sub_account_id> <api_key_id>`, keep `--label --permissions`

11. **`sub-account/api-key-list.ts`** — `--subAccountId` → `<sub_account_id>`, remove options

12. **`sub-account/api-key-reset.ts`** — `--subAccountId --apiKeyId` → `<sub_account_id> <api_key_id>`, remove options

13. **`sub-account/ip-add.ts`** — `--subAccountId --apiKeyId --ip` → `<sub_account_id> <api_key_id> <ip>`, remove options

14. **`sub-account/ip-delete.ts`** — `--subAccountId --apiKeyId --ip` → `<sub_account_id> <api_key_id> <ip>`, remove options

15. **`sub-account/ip-list.ts`** — `--subAccountId --apiKeyId` → `<sub_account_id> <api_key_id>`, remove options

**Must NOT do**:
- Do NOT touch `sub-account/list.ts` or `sub-account/transfer-history.ts` (only optional flags)
- Do NOT change semantics of fromId/toId in transfer.ts (optional = main account)

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
- **Skills**: [`git-master`]

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 4, 5)
- **Blocks**: Task 8
- **Blocked By**: Task 0

**References**:

**Pattern References**:
- `src/commands/deposit/deposit-refund.ts` — all-required, remove options
- `src/commands/deposit/deposit-address.ts:10-49` — positional + remaining flags mix (for transfer.ts, api-key-edit.ts)
- `src/lib/cli-helpers.ts:3-22` — parseArg signature

**Files to Modify**:
- `src/commands/sub-account/create.ts`
- `src/commands/sub-account/delete.ts`
- `src/commands/sub-account/balance.ts`
- `src/commands/sub-account/block.ts`
- `src/commands/sub-account/unblock.ts`
- `src/commands/sub-account/edit.ts`
- `src/commands/sub-account/transfer.ts`
- `src/commands/sub-account/api-key-create.ts`
- `src/commands/sub-account/api-key-delete.ts`
- `src/commands/sub-account/api-key-edit.ts`
- `src/commands/sub-account/api-key-list.ts`
- `src/commands/sub-account/api-key-reset.ts`
- `src/commands/sub-account/ip-add.ts`
- `src/commands/sub-account/ip-delete.ts`
- `src/commands/sub-account/ip-list.ts`
- `test/commands/sub-account/create.test.ts`
- `test/commands/sub-account/transfer.test.ts`

**Test Update Detail**:

`test/commands/sub-account/create.test.ts`:
- `flags: { alias: 'test@example.com' }` → `positional: ['test@example.com'], flags: {}`

`test/commands/sub-account/transfer.test.ts`:
- `flags: { ticker: 'BTC', amount: '0.5', fromId: 'sub1', toId: 'sub2' }` → `positional: ['BTC', '0.5'], flags: { fromId: 'sub1', toId: 'sub2' }`
- `flags: { ticker: 'BTC', amount: '0.5' }` → `positional: ['BTC', '0.5'], flags: {}`

**Acceptance Criteria**:

```
Scenario: All 15 sub-account files converted, tests pass
  Tool: Bash
  Steps:
    1. grep -rl "import.*option.*from.*@bunli/core" src/commands/sub-account/create.ts src/commands/sub-account/delete.ts src/commands/sub-account/balance.ts
    2. Assert: no output (option import removed from fully-positional files)
    3. grep "import.*option.*from.*@bunli/core" src/commands/sub-account/transfer.ts
    4. Assert: match found (option import kept for --fromId/--toId)
    5. bun run typecheck
    6. Assert: exit code 0
    7. bun test test/commands/sub-account/create.test.ts test/commands/sub-account/transfer.test.ts
    8. Assert: exit code 0, all tests pass
    9. bun test
    10. Assert: exit code 0
  Expected Result: All sub-account commands converted, tests green
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(sub-account): convert sub-account command flags to positional args`
- Files: 15 command files + 2 test files
- Pre-commit: `bun run typecheck && bun test`

---

### Task 7: convert Group (2 files + 2 tests)

**What to do**:

Convert required flags to positional for both convert commands. Remove `option` import and `options: {}` entirely (no optional flags remain).

**File-by-file conversion spec**:

1. **`convert/estimate.ts`** — `--from --to --amount` → `<from> <to> <amount>`, remove options
   - positional[0] → from (z.string), positional[1] → to (z.string), positional[2] → amount (z.string)
   - Usage: `'whitebit trade convert estimate <from> <to> <amount>'`

2. **`convert/confirm.ts`** — `--estimateId` → `<estimate_id>`, remove options
   - positional[0] → estimateId (z.string)
   - Usage: `'whitebit trade convert confirm <estimate_id>'`

**Must NOT do**:
- Do NOT touch `convert/history.ts` (only optional flags)

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: [`git-master`]

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Tasks 1, 2, 3)
- **Blocks**: Task 8
- **Blocked By**: Task 0

**References**:

**Pattern References**:
- `src/commands/deposit/deposit-refund.ts` — all-required, remove options

**Files to Modify**:
- `src/commands/convert/estimate.ts`
- `src/commands/convert/confirm.ts`
- `test/commands/convert/estimate.test.ts`
- `test/commands/convert/confirm.test.ts`

**Test Update Detail**:

`test/commands/convert/estimate.test.ts`:
- `flags: { from: 'BTC', to: 'USDT', amount: '1' }` → `positional: ['BTC', 'USDT', '1'], flags: {}`

`test/commands/convert/confirm.test.ts`:
- `flags: { estimateId: 'est-123' }` → `positional: ['est-123'], flags: {}`

**Acceptance Criteria**:

```
Scenario: Both convert files converted, tests pass
  Tool: Bash
  Steps:
    1. grep -c "import.*option.*from.*@bunli/core" src/commands/convert/estimate.ts src/commands/convert/confirm.ts
    2. Assert: both show 0
    3. grep -l "parseArg" src/commands/convert/estimate.ts src/commands/convert/confirm.ts
    4. Assert: both files listed
    5. bun run typecheck
    6. Assert: exit code 0
    7. bun test test/commands/convert/estimate.test.ts test/commands/convert/confirm.test.ts
    8. Assert: exit code 0
    9. bun test
    10. Assert: exit code 0
  Expected Result: Both convert commands use positional args, tests green
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `refactor(convert): convert estimate and confirm flags to positional args`
- Files: 2 command files + 2 test files
- Pre-commit: `bun run typecheck && bun test`

---

### Task 8: README Update (1 file)

**What to do**:

Update `README.md` to reflect correct positional argument syntax for ALL commands converted in Tasks 1–7. This is a documentation-only pass.

**Specific sections to update**:

1. **Earn section** — Update command examples:
   - `earn fixed invest <plan_id> <amount>`
   - `earn fixed close-investment <id>`
   - `earn flex invest <plan_id> <amount>`
   - `earn flex withdraw <id> <amount>`
   - `earn flex close <id>`
   - `earn flex auto-reinvest <id> <enabled>`

2. **Market section** — Update command examples:
   - `market depth <pair>` (already correct in current README)
   - `market trades <pair>` (already correct)
   - `market kline <pair> <interval>` (already correct)
   - `market funding-history <pair>` (already correct)

3. **Trading section** — Update command examples:
   - `trade spot limit-order <pair> <side> <amount> <price>`
   - `trade spot market-order <pair> <side> <amount>`
   - `trade spot stop-limit <pair> <side> <amount> <price> <activation_price>`
   - `trade spot stop-market <pair> <side> <amount> <activation_price>`
   - `trade spot buy-stock <pair> <amount>`
   - `trade spot bulk-order <pair> --orders '<json>'`
   - `trade spot cancel <pair> <order_id>`
   - `trade spot modify <pair> <order_id>`
   - `trade spot fee <pair>`
   - `trade spot kill-switch-sync <pair> <timeout>`
   - `trade spot deals <order_id>`

4. **Collateral section** — Update command examples:
   - All collateral order commands with positional args
   - `trade collateral set-leverage <pair> <leverage>`
   - `trade collateral close-position <pair>`
   - `trade collateral cancel-conditional <pair> <order_id>`
   - `trade collateral cancel-oco <pair> <order_id>`
   - `trade collateral cancel-oto <pair> <order_id>`
   - `trade collateral create-oco <pair> <side> <amount> <price> <stop_price>`
   - `trade collateral create-oto <pair> <side> <amount> <price> <trigger_price>`
   - `trade collateral set-hedge-mode <enabled>`

5. **Sub-Account section** — Update command examples:
   - `sub-account create <alias>`
   - `sub-account balance <id>`
   - `sub-account transfer <asset> <amount>`
   - All api-key and ip sub-commands with positional args

6. **Convert section** — Update command examples:
   - `trade convert estimate <from> <to> <amount>`
   - `trade convert confirm <estimate_id>`

7. **Examples section** — Update the limit order example:
   - OLD: `whitebit trade spot limit-order -m BTC_USDT -s buy -p 50000 -a 0.001`
   - NEW: `whitebit trade spot limit-order BTC_USDT buy 0.001 50000`

**Must NOT do**:
- Do NOT rewrite entire README or add new sections
- Do NOT change installation, configuration, or security sections
- Do NOT change descriptions — only update syntax/examples
- ONLY update lines that show `--flag` syntax for converted commands

**Recommended Agent Profile**:
- **Category**: `quick`
- **Skills**: [`git-master`]

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 4 (solo, final)
- **Blocks**: None
- **Blocked By**: Tasks 1–7

**References**:

**Files to Modify**:
- `README.md` — update command syntax examples only

**Acceptance Criteria**:

```
Scenario: README reflects positional arg syntax for all converted commands
  Tool: Bash
  Steps:
    1. grep -c "\-\-market" README.md
    2. Assert: 0 occurrences (all --market flags converted to positional in docs)
    3. grep -c "\-\-orderId" README.md
    4. Assert: 0 occurrences
    5. grep "limit-order.*<pair>.*<side>.*<amount>.*<price>" README.md
    6. Assert: match found
    7. grep "trade spot limit-order BTC_USDT buy" README.md
    8. Assert: match found in examples section
    9. bun run lint
    10. Assert: exit code 0
  Expected Result: README accurately documents positional syntax
  Evidence: Terminal output captured
```

**Commit**: YES
- Message: `docs: update README with positional arg syntax for all converted commands`
- Files: `README.md`
- Pre-commit: `bun run lint`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 0 | `refactor(cli): remove stale option imports from already-converted commands` | 4 files | typecheck + test |
| 1 | `refactor(balance): convert main-balance --ticker to optional positional [asset]` | 2 files | typecheck + test |
| 2 | `refactor(earn): convert all earn command flags to positional args` | 6 files | typecheck + test |
| 3 | `refactor(market): convert required market flags to positional args` | 6 files | typecheck + test |
| 4 | `refactor(trade): convert spot trading command flags to positional args` | 13 files | typecheck + test |
| 5 | `refactor(collateral): convert collateral command flags to positional args` | 14 files | typecheck + test |
| 6 | `refactor(sub-account): convert sub-account command flags to positional args` | 17 files | typecheck + test |
| 7 | `refactor(convert): convert estimate and confirm flags to positional args` | 4 files | typecheck + test |
| 8 | `docs: update README with positional arg syntax for all converted commands` | 1 file | lint |

---

## Success Criteria

### Verification Commands
```bash
bun run typecheck  # Expected: exit code 0
bun test           # Expected: exit code 0 (excluding 21 pre-existing account API failures)
bun run lint       # Expected: exit code 0
```

### Final Checklist
- [ ] All 51 command files converted (flags→positional for required args)
- [ ] All 4 stale import files cleaned up
- [ ] All 10 test files updated to match new handler signatures
- [ ] `option` import removed from files with zero remaining flags
- [ ] `option` import preserved in files with remaining optional flags
- [ ] `z.coerce.number()` used for ALL numeric positional args
- [ ] `z.enum(["true","false"]).transform()` used for boolean positional args
- [ ] `--orders` kept as flag in both bulk-order files
- [ ] README updated with positional syntax for all converted commands
- [ ] No handler business logic or API calls changed
- [ ] No exported variable names changed
- [ ] `completion.ts`, `login.ts`, `config/` files untouched
