# CLI Command Restructure — Logical Root-Level Groups

## TL;DR

> **Quick Summary**: Restructure WhiteBIT CLI command groups from API-doc-mirroring to user-mental-model grouping. Break the monolithic `account` group (27 flat commands) into focused root-level groups: `balance`, `deposit`, `withdraw`, `transfer`, `codes`, `earn` (with `fixed`/`flex` subgroups), plus `credit-lines` and `ws-token` as standalone root commands. Absorb orphaned commands into `market`. Delete `issue-jwt-token`.
>
> **Deliverables**:
> - Restructured CLI groups with new directory layout and barrel files
> - Updated help text, completion scripts (bash/zsh/fish), README
> - Updated/new group nesting tests
> - Updated `scripts/run-all-get.sh`
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8

---

## Context

### Original Request
"Let's make easy to understand CLI groups. Let's not rely on how docs structured, instead logically structure everything on root level like `{cli} codes`, `{cli} flex`."

### Interview Summary
**Key Discussions**:
- `account` group is a dumping ground with 27 commands — needs decomposition
- User wants domain-based grouping at root level by user mental model
- Orphaned commands (`server-time`, `status`, `pool`) → absorb into `market`
- Staking → `earn` group with `fixed` and `flex` nested subgroups
- Flex command names should strip the `flex-` prefix (since already under `earn flex`)
- `issue-jwt-token` should be deleted entirely
- `ws-token` → standalone root command
- `credit-lines` → standalone root command
- `mining-hashrate` → `market` group (alongside `mining-pool`)
- `login` stays at root level
- `trade` and `sub-account` unchanged

**Research Findings**:
- Framework: `@bunli/core` supports `defineGroup()` with nested groups in `commands[]`
- Existing nesting pattern in `trade/index.ts` (spot/collateral/convert subgroups) → follow this for `earn`
- Completion script has hardcoded command lists for 3 shells (bash, zsh, fish) — all must be updated
- Help text in `help.ts` is hardcoded — must be rewritten
- **Pre-existing 21 test failures** (242 pass, 21 fail) — baseline, do not fix or worsen

### Metis Review
**Identified Gaps** (addressed):
- **Phantom commands**: `transfer-history`, `overview`, `rewards` referenced in README but don't exist as implementations — EXCLUDED from plan
- **`mining-hashrate` semantic mismatch**: Requires auth but moves to `market` group ("Public market data") — description update needed for `market` group
- **Pre-existing test baseline**: 21 failures must remain unchanged (242 pass, 21 fail)
- **`scripts/run-all-get.sh`**: Hardcodes command paths — must update
- **Flex name stripping**: 8 `defineCommand` name changes required for flex commands

---

## Work Objectives

### Core Objective
Restructure CLI command groups to follow user mental model instead of API documentation structure, making the CLI intuitive for exchange users.

### Concrete Deliverables
- New directory structure: `src/commands/{balance,deposit,withdraw,transfer,codes,earn}/`
- Barrel files (`index.ts`) for each new group
- Rewritten `src/cli.ts` with new group registrations
- Rewritten `src/commands/help.ts` with new help text
- Rewritten `src/commands/completion.ts` with new command lists
- Updated `test/commands/trade/nesting.test.ts` + new group nesting tests
- Updated `scripts/run-all-get.sh`
- Updated `README.md` command reference
- Deleted: `src/commands/account/issue-jwt-token.ts`

### Definition of Done
- [ ] `bun run typecheck` passes with zero new type errors
- [ ] `bun test` shows 242+ pass, ≤21 fail (same or better than baseline)
- [ ] `bun run lint` passes with zero lint errors
- [ ] All new groups accessible via CLI: `bun src/cli.ts balance --help`, `bun src/cli.ts earn --help`, etc.
- [ ] Shell completion includes all new groups
- [ ] `issue-jwt-token.ts` file deleted

### Must Have
- All 27 former `account` commands accounted for in new groups (minus `issue-jwt-token`)
- `earn` group with `fixed` and `flex` nested subgroups
- 3-level shell completion for `earn > fixed|flex > commands`
- Flex commands stripped of `flex-` prefix
- `server-time`, `status`, `mining-pool` absorbed into `market` group
- `pool` group removed

### Must NOT Have (Guardrails)
- NO changes to command handler logic, options, or API calls
- NO changes to `src/lib/api/*.ts` or `src/lib/types/*.ts`
- NO fixing pre-existing test failures
- NO creating new commands that don't exist (`overview`, `rewards`, account `transfer-history`)
- NO changes to `src/commands/trade/` or `src/commands/sub-account/` internal structure
- NO renaming exported variable names (keep `accountMainBalanceCommand` etc.)
- NO premature abstraction or utility extraction
- NO breaking `src/commands/market/helpers.ts` relative imports

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL verification is executed by the agent using tools. No human action permitted.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after (update existing + add new nesting tests)
- **Framework**: bun test

### Pre-Existing Test Baseline
- **242 pass, 21 fail** — this is the immutable baseline
- All 21 failures are in `test/lib/api/account.test.ts` (pre-existing, unrelated to this refactoring)
- Refactoring must NOT increase failure count

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| TypeScript compilation | Bash | `bun run typecheck` |
| Tests | Bash | `bun test` |
| Lint | Bash | `bun run lint` |
| CLI help output | Bash | `bun src/cli.ts help` |
| Completion output | Bash | `bun src/cli.ts completion --shell bash` |
| File existence | Bash | `test -f path && echo OK` |
| File deletion | Bash | `test ! -f path && echo DELETED` |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Create new directory structure + move files
└── (sequential — must complete before Wave 2)

Wave 2 (After Wave 1):
├── Task 2: Create barrel index.ts files for new groups
├── Task 3: Strip flex- prefix from flex command names
└── (sequential — 2 depends on 1, 3 depends on 1)

Wave 3 (After Wave 2):
├── Task 4: Rewrite cli.ts group registrations
└── (sequential — depends on 2, 3)

Wave 4 (After Wave 3):
├── Task 5: Rewrite completion.ts
├── Task 6: Rewrite help.ts
└── (parallel — both depend on 4 but independent of each other)

Wave 5 (After Wave 4):
├── Task 7: Update tests
├── Task 8: Update README.md + run-all-get.sh
└── (parallel — both depend on 4-6 but independent of each other)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None (foundation) |
| 2 | 1 | 4 | 3 |
| 3 | 1 | 4 | 2 |
| 4 | 2, 3 | 5, 6, 7, 8 | None (integration point) |
| 5 | 4 | 7 | 6 |
| 6 | 4 | 7 | 5 |
| 7 | 4, 5, 6 | None | 8 |
| 8 | 4 | None | 7 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | delegate_task(category="unspecified-high", load_skills=["git-master"]) |
| 2 | 2, 3 | delegate_task(category="quick", ...) — sequential after Wave 1 |
| 3 | 4 | delegate_task(category="unspecified-high", ...) — critical integration |
| 4 | 5, 6 | delegate_task(category="quick", ...) — parallel |
| 5 | 7, 8 | delegate_task(category="quick", ...) — parallel |

---

## Target Structure Reference

### From → To Mapping (Complete)

**Current `account` group commands → New locations:**

| Command | Current Path | New Group | New Dir | Name Change? |
|---------|-------------|-----------|---------|--------------|
| main-balance | account/main-balance.ts | `balance` | balance/ | No |
| balance | account/balance.ts | `balance` | balance/ | No |
| fee | account/fee.ts | `balance` | balance/ | No |
| deposit-address | account/deposit-address.ts | `deposit` | deposit/ | No |
| fiat-deposit-address | account/fiat-deposit-address.ts | `deposit` | deposit/ | No |
| create-address | account/create-address.ts | `deposit` | deposit/ | No |
| deposit-refund | account/deposit-refund.ts | `deposit` | deposit/ | No |
| withdraw-crypto | account/withdraw-crypto.ts | `withdraw` | withdraw/ | No |
| withdraw-crypto-amount | account/withdraw-crypto-amount.ts | `withdraw` | withdraw/ | No |
| withdraw-fiat | account/withdraw-fiat.ts | `withdraw` | withdraw/ | No |
| withdraw-history | account/withdraw-history.ts | `withdraw` | withdraw/ | No |
| transfer | account/transfer.ts | `transfer` | transfer/ | No |
| create-code | account/create-code.ts | `codes` | codes/ | No |
| apply-code | account/apply-code.ts | `codes` | codes/ | No |
| codes-history | account/codes-history.ts | `codes` | codes/ | No |
| my-codes | account/my-codes.ts | `codes` | codes/ | No |
| plans | account/plans.ts | `earn fixed` | earn/fixed/ | No |
| invest | account/invest.ts | `earn fixed` | earn/fixed/ | No |
| investments-history | account/investments-history.ts | `earn fixed` | earn/fixed/ | No |
| close-investment | account/close-investment.ts | `earn fixed` | earn/fixed/ | No |
| flex-plans | account/flex-plans.ts | `earn flex` | earn/flex/ | **YES → `plans`** |
| flex-invest | account/flex-invest.ts | `earn flex` | earn/flex/ | **YES → `invest`** |
| flex-investments | account/flex-investments.ts | `earn flex` | earn/flex/ | **YES → `investments`** |
| flex-investment-history | account/flex-investment-history.ts | `earn flex` | earn/flex/ | **YES → `investment-history`** |
| flex-payment-history | account/flex-payment-history.ts | `earn flex` | earn/flex/ | **YES → `payment-history`** |
| flex-withdraw | account/flex-withdraw.ts | `earn flex` | earn/flex/ | **YES → `withdraw`** |
| flex-close | account/flex-close.ts | `earn flex` | earn/flex/ | **YES → `close`** |
| flex-auto-reinvest | account/flex-auto-reinvest.ts | `earn flex` | earn/flex/ | **YES → `auto-reinvest`** |
| interest-history | account/interest-history.ts | `earn` (root) | earn/ | No |
| mining-hashrate | account/mining-hashrate.ts | `market` | market/ | No |
| credit-lines | account/credit-lines.ts | root standalone | stays in account/ or moves | No |
| ws-token | account/ws-token.ts | root standalone | stays in account/ or moves | No |
| issue-jwt-token | account/issue-jwt-token.ts | **DELETED** | — | — |

**Other moves:**

| Command | Current Location | New Location |
|---------|-----------------|--------------|
| server-time | `market/server-time.ts` (root registration) | `market` group (re-register) |
| status | `market/status.ts` (root registration) | `market` group (re-register) |
| mining-pool | `market/mining-pool.ts` (pool group) | `market` group (re-register) |

---

## TODOs

- [ ] 1. Create new directory structure and move command files

  **What to do**:
  - Create directories: `src/commands/balance/`, `src/commands/deposit/`, `src/commands/withdraw/`, `src/commands/transfer/`, `src/commands/codes/`, `src/commands/earn/`, `src/commands/earn/fixed/`, `src/commands/earn/flex/`
  - Use `git mv` to move each file from `src/commands/account/` to its new directory per the From→To mapping table above
  - Move `mining-hashrate.ts` from `account/` to `market/`
  - Move `credit-lines.ts` out of `account/` (to a root-level location, e.g., keep in `account/` but will be registered standalone, OR move to `src/commands/credit-lines.ts`)
  - Move `ws-token.ts` out of `account/` (similar approach)
  - Delete `src/commands/account/issue-jwt-token.ts`
  - After all moves, the `src/commands/account/` directory should be empty and can be removed

  **Must NOT do**:
  - Do NOT rename exported variable names (keep `accountMainBalanceCommand`, `accountFlexInvestCommand`, etc.)
  - Do NOT use copy+delete — use `git mv` to preserve history
  - Do NOT move any file from `src/commands/trade/` or `src/commands/sub-account/`
  - Do NOT move `src/commands/market/helpers.ts`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Many file moves (~33 files) that must be precise — high-effort mechanical task
  - **Skills**: [`git-master`]
    - `git-master`: Required for `git mv` operations to preserve file history

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/commands/trade/index.ts:1-55` — Barrel file pattern to follow for new groups
  - `src/commands/sub-account/index.ts:1-42` — Alternative barrel file pattern

  **File References**:
  - Complete From→To mapping table in "Target Structure Reference" section above
  - `src/commands/account/*.ts` — All 33 files, each needs to move to its designated new directory

  **Acceptance Criteria**:

  - [ ] All new directories exist: `src/commands/{balance,deposit,withdraw,transfer,codes,earn,earn/fixed,earn/flex}/`
  - [ ] `src/commands/account/` directory is empty or removed
  - [ ] `src/commands/account/issue-jwt-token.ts` does not exist
  - [ ] All moved files are tracked by git (git mv used)
  - [ ] `src/commands/market/mining-hashrate.ts` exists
  - [ ] `src/commands/market/helpers.ts` is untouched

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify all new directories created
    Tool: Bash
    Steps:
      1. ls -d src/commands/balance src/commands/deposit src/commands/withdraw src/commands/transfer src/commands/codes src/commands/earn src/commands/earn/fixed src/commands/earn/flex
      2. Assert: all 8 directories listed without error
    Expected Result: All directories exist
    Evidence: Command output captured

  Scenario: Verify issue-jwt-token deleted
    Tool: Bash
    Steps:
      1. test ! -f src/commands/account/issue-jwt-token.ts && echo "DELETED" || echo "STILL EXISTS"
      2. Assert: output is "DELETED"
    Expected Result: File deleted
    Evidence: Command output

  Scenario: Verify git tracks the moves
    Tool: Bash
    Steps:
      1. git status --short | head -40
      2. Assert: output shows R (renamed) entries, not D+A pairs
    Expected Result: git mv preserved history
    Evidence: git status output
  ```

  **Commit**: YES
  - Message: `refactor(cli): move account commands to logical root-level directories`
  - Files: All moved files
  - Pre-commit: `bun run typecheck` (may show errors until barrel files are created — expected)

---

- [ ] 2. Create barrel index.ts files for each new group

  **What to do**:
  - Create `src/commands/balance/index.ts` — export `balanceGroup` using `defineGroup()` containing: `accountMainBalanceCommand`, `accountBalanceCommand`, `accountFeeCommand`
  - Create `src/commands/deposit/index.ts` — export `depositGroup` with: `accountDepositAddressCommand`, `accountFiatDepositAddressCommand`, `accountCreateAddressCommand`, `accountDepositRefundCommand`
  - Create `src/commands/withdraw/index.ts` — export `withdrawGroup` with: `accountWithdrawCryptoCommand`, `accountWithdrawCryptoAmountCommand`, `accountWithdrawFiatCommand`, `accountWithdrawHistoryCommand`
  - Create `src/commands/transfer/index.ts` — export `transferGroup` with: `accountTransferCommand`
  - Create `src/commands/codes/index.ts` — export `codesGroup` with: `accountCreateCodeCommand`, `accountApplyCodeCommand`, `accountCodesHistoryCommand`, `accountMyCodesCommand`
  - Create `src/commands/earn/fixed/index.ts` — export `fixedGroup` with: `accountPlansCommand`, `accountInvestCommand`, `accountInvestmentsHistoryCommand`, `accountCloseInvestmentCommand`
  - Create `src/commands/earn/flex/index.ts` — export `flexGroup` with the 8 flex commands (using their NEW stripped names — after Task 3)
  - Create `src/commands/earn/index.ts` — export `earnGroup` with `fixedGroup`, `flexGroup`, and `accountInterestHistoryCommand`
  - All barrel files should follow the import + defineGroup pattern from `src/commands/trade/index.ts`
  - Update all import paths to reference new file locations (the files moved in Task 1)

  **Must NOT do**:
  - Do NOT change any command handler logic
  - Do NOT rename exported variable names
  - Do NOT add commands that don't exist (`overview`, `rewards`, `transfer-history`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mechanical file creation following established patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/commands/trade/index.ts:1-55` — Barrel file pattern with subgroups (spot/collateral/convert → follow for earn with fixed/flex)
  - `src/commands/collateral/index.ts:1-53` — Simple barrel file pattern
  - `src/commands/convert/index.ts:1-11` — Minimal barrel file pattern

  **Acceptance Criteria**:

  - [ ] All 8 barrel files exist: `src/commands/{balance,deposit,withdraw,transfer,codes}/index.ts` + `src/commands/earn/{index,fixed/index,flex/index}.ts`
  - [ ] Each barrel file exports a named group constant using `defineGroup()`
  - [ ] `earnGroup` contains `fixedGroup`, `flexGroup`, and `accountInterestHistoryCommand` in its `commands[]`
  - [ ] All import paths resolve correctly (no broken imports)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify barrel files exist
    Tool: Bash
    Steps:
      1. ls src/commands/balance/index.ts src/commands/deposit/index.ts src/commands/withdraw/index.ts src/commands/transfer/index.ts src/commands/codes/index.ts src/commands/earn/index.ts src/commands/earn/fixed/index.ts src/commands/earn/flex/index.ts
      2. Assert: all 8 files listed without error
    Expected Result: All barrel files created
    Evidence: ls output

  Scenario: Verify earn group has correct structure
    Tool: Bash
    Steps:
      1. grep -c "fixedGroup\|flexGroup\|accountInterestHistoryCommand" src/commands/earn/index.ts
      2. Assert: count >= 3
    Expected Result: Earn group references both subgroups and interest-history
    Evidence: grep output
  ```

  **Commit**: YES (group with Task 3)
  - Message: `refactor(cli): create barrel files for new command groups`
  - Files: All new `index.ts` files
  - Pre-commit: `bun run typecheck`

---

- [ ] 3. Strip flex- prefix from flex command names

  **What to do**:
  - In each of the 8 flex command files (now in `src/commands/earn/flex/`), update the `name` property in `defineCommand()`:
    - `flex-plans` → `plans`
    - `flex-invest` → `invest`
    - `flex-investments` → `investments`
    - `flex-investment-history` → `investment-history`
    - `flex-payment-history` → `payment-history`
    - `flex-withdraw` → `withdraw`
    - `flex-close` → `close`
    - `flex-auto-reinvest` → `auto-reinvest`
  - Do NOT rename the file names themselves (the files are already named without prefix after `git mv`, or keep original filenames — just change the `name:` property in `defineCommand()`)
  - Do NOT rename the exported variable names (keep `accountFlexInvestCommand` etc.)

  **Must NOT do**:
  - Do NOT change handler logic, options, or descriptions
  - Do NOT rename exported constants
  - Do NOT change anything other than the `name:` string in `defineCommand()`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 8 single-line string edits — trivial mechanical change
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/commands/account/flex-invest.ts:9` — Current: `name: 'flex-invest'` → Change to: `name: 'invest'`
  - All 8 flex files follow the same `defineCommand({ name: '...' })` pattern

  **Acceptance Criteria**:

  - [ ] All 8 flex commands have `name:` without `flex-` prefix
  - [ ] No flex command file has `name: 'flex-` anywhere
  - [ ] Exported variable names unchanged (still `accountFlexInvestCommand`, etc.)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify no flex- prefix remains in command names
    Tool: Bash
    Steps:
      1. grep -rn "name: 'flex-" src/commands/earn/flex/
      2. Assert: zero matches (exit code 1 from grep)
    Expected Result: No flex- prefixed names found
    Evidence: grep output (empty)

  Scenario: Verify exported names unchanged
    Tool: Bash
    Steps:
      1. grep -rn "export const accountFlex" src/commands/earn/flex/ | wc -l
      2. Assert: count is 8
    Expected Result: All 8 flex exports preserved
    Evidence: grep count output
  ```

  **Commit**: YES (group with Task 2)
  - Message: `refactor(cli): strip flex- prefix from earn flex command names`
  - Files: 8 flex command files
  - Pre-commit: `bun run typecheck`

---

- [ ] 4. Rewrite cli.ts — new group registrations and imports

  **What to do**:
  - Remove all `import` statements for individual account commands (lines 3-37 of current cli.ts)
  - Add imports for new barrel files: `import { balanceGroup } from './commands/balance'`, `import { depositGroup } from './commands/deposit'`, etc.
  - Import standalone commands: `import { accountCreditLinesCommand } from './commands/credit-lines'` (or wherever it lives), `import { accountWsTokenCommand } from './commands/ws-token'`
  - Remove `accountGroup` definition (lines 207-247)
  - Remove `poolGroup` definition (lines 201-205)
  - Update `marketGroup` to include: `serverTimeCommand`, `statusCommand`, `miningPoolCommand`, `accountMiningHashrateCommand` in addition to existing market commands. Update description to: `'Market data and platform status'` (since it now includes auth commands like mining-hashrate)
  - Register new groups: `cli.command(balanceGroup)`, `cli.command(depositGroup)`, `cli.command(withdrawGroup)`, `cli.command(transferGroup)`, `cli.command(codesGroup)`, `cli.command(earnGroup)`
  - Register standalone commands: `cli.command(accountCreditLinesCommand)`, `cli.command(accountWsTokenCommand)`
  - Remove: `cli.command(accountGroup)`, `cli.command(poolGroup)`, `cli.command(serverTimeCommand)`, `cli.command(statusCommand)`
  - Keep unchanged: `cli.command(tradeGroup)`, `cli.command(subAccountGroup)`, `cli.command(configGroup)`, `cli.command(completionCommand)`, `cli.command(loginCommand)`, `cli.command(helpCommand)`

  **Must NOT do**:
  - Do NOT change `parseGlobalOptions` or any global option handling
  - Do NOT change the `createCLI` configuration
  - Do NOT modify trade, sub-account, or config group registrations
  - Do NOT change any command behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Central integration file — single point of failure, many import changes, must be precise
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (solo)
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/cli.ts:182-199` — Current `marketGroup` definition pattern
  - `src/cli.ts:273-283` — Current group/command registration pattern
  - `src/commands/trade/index.ts:49-52` — Barrel import + group composition pattern

  **File References**:
  - `src/cli.ts` — The entire file (285 lines) — central integration point

  **Acceptance Criteria**:

  - [ ] `bun run typecheck` passes (zero new errors)
  - [ ] No references to `accountGroup` or `poolGroup` in `src/cli.ts`
  - [ ] No direct import from `./commands/account/` in `src/cli.ts` (all go through barrel files)
  - [ ] `serverTimeCommand` and `statusCommand` are inside `marketGroup`, not standalone `cli.command()` calls
  - [ ] All new groups registered: `balanceGroup`, `depositGroup`, `withdrawGroup`, `transferGroup`, `codesGroup`, `earnGroup`
  - [ ] `creditLinesCommand` and `wsTokenCommand` registered as standalone `cli.command()` calls

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: TypeScript compiles cleanly
    Tool: Bash
    Steps:
      1. bun run typecheck 2>&1
      2. Assert: exit code 0 OR only pre-existing errors (grep for "error TS")
    Expected Result: No new type errors
    Evidence: typecheck output

  Scenario: CLI starts and shows help
    Tool: Bash
    Steps:
      1. bun src/cli.ts help 2>&1
      2. Assert: output contains "WhiteBIT CLI"
    Expected Result: CLI boots successfully
    Evidence: help output

  Scenario: New groups are accessible
    Tool: Bash
    Steps:
      1. bun src/cli.ts balance 2>&1 (expect help or error, not "unknown command")
      2. bun src/cli.ts earn 2>&1
      3. bun src/cli.ts deposit 2>&1
      4. bun src/cli.ts withdraw 2>&1
      5. bun src/cli.ts codes 2>&1
      6. Assert: none return "unknown command" errors
    Expected Result: All new groups recognized by CLI
    Evidence: CLI output for each group

  Scenario: Old groups are removed
    Tool: Bash
    Steps:
      1. grep -c "poolGroup" src/cli.ts
      2. Assert: 0
      3. grep -c "accountGroup" src/cli.ts
      4. Assert: 0
    Expected Result: Old group registrations removed
    Evidence: grep counts
  ```

  **Commit**: YES
  - Message: `refactor(cli): register new root-level command groups in cli.ts`
  - Files: `src/cli.ts`
  - Pre-commit: `bun run typecheck`

---

- [ ] 5. Rewrite completion.ts with new command structure

  **What to do**:
  - Replace all hardcoded command lists in `src/commands/completion.ts`:
    - Remove `ACCOUNT_COMMANDS` array
    - Remove `POOL_COMMANDS` array
    - Add: `BALANCE_COMMANDS`, `DEPOSIT_COMMANDS`, `WITHDRAW_COMMANDS`, `TRANSFER_COMMANDS`, `CODES_COMMANDS`, `EARN_GROUPS` (fixed, flex), `EARN_FIXED_COMMANDS`, `EARN_FLEX_COMMANDS`
    - Update `ROOT_COMMANDS` to include new group names: `balance`, `deposit`, `withdraw`, `transfer`, `codes`, `credit-lines`, `earn`, `ws-token` (and remove `account`, `pool`)
    - Update `MARKET_COMMANDS` to add: `server-time`, `status`, `mining-pool`, `mining-hashrate`
  - Update all 3 shell completion generators (bash, zsh, fish):
    - Remove `account)` case
    - Remove `pool)` case
    - Add cases for: `balance)`, `deposit)`, `withdraw)`, `transfer)`, `codes)`
    - Add 3-level completion for `earn)` → `fixed` / `flex` → subcommands (follow `trade` pattern)
    - `credit-lines` and `ws-token` are leaf commands at root — no subcommand completion needed
  - Use flex command names WITHOUT `flex-` prefix (stripped names)

  **Must NOT do**:
  - Do NOT change the completion script generation logic/helpers
  - Do NOT change how `renderBashCompletion`, `renderZshCompletion`, `renderFishCompletion` work structurally
  - Do NOT add completion for commands that don't exist

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mechanical rewrite of hardcoded lists — pattern established
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 6)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 7
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `src/commands/completion.ts:112-135` — Existing `TRADE_COLLATERAL_COMMANDS` pattern for nested groups
  - `src/commands/completion.ts:181-198` — Existing bash completion nesting for `trade > spot|collateral|convert` — follow this pattern for `earn > fixed|flex`
  - `src/commands/completion.ts:232-242` — Existing zsh completion nesting for 3 levels
  - `src/commands/completion.ts:275-296` — Existing fish completion nesting for 3 levels

  **Acceptance Criteria**:

  - [ ] `ROOT_COMMANDS` contains: `balance`, `deposit`, `withdraw`, `transfer`, `codes`, `credit-lines`, `earn`, `ws-token`, `market`, `trade`, `sub-account`, `config`, `help`, `completion`, `login`
  - [ ] `ROOT_COMMANDS` does NOT contain: `account`, `pool`, `server-time`, `status`
  - [ ] `MARKET_COMMANDS` includes: `server-time`, `status`, `mining-pool`, `mining-hashrate`
  - [ ] All 3 shell generators updated consistently
  - [ ] `earn` has 3-level completion (earn → fixed/flex → subcommands)
  - [ ] Flex commands use stripped names (no `flex-` prefix)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Bash completion includes new groups
    Tool: Bash
    Steps:
      1. bun src/cli.ts completion --shell bash 2>/dev/null | grep -c "balance\|deposit\|withdraw\|transfer\|codes\|earn\|credit-lines\|ws-token"
      2. Assert: count > 0
    Expected Result: All new groups present in bash completion
    Evidence: grep count

  Scenario: Bash completion has earn 3-level nesting
    Tool: Bash
    Steps:
      1. bun src/cli.ts completion --shell bash 2>/dev/null | grep -A 20 "earn)"
      2. Assert: output contains "fixed" and "flex" subgroups with their commands
    Expected Result: 3-level nesting for earn group
    Evidence: grep output

  Scenario: Old groups removed from completion
    Tool: Bash
    Steps:
      1. bun src/cli.ts completion --shell bash 2>/dev/null | grep -c "ACCOUNT_COMMANDS\|POOL_COMMANDS"
      2. Assert: 0 (variable names shouldn't appear, but checking grep for 'account)' case)
      3. bun src/cli.ts completion --shell bash 2>/dev/null | grep "account)"
      4. Assert: no match
    Expected Result: No account or pool completion
    Evidence: grep output
  ```

  **Commit**: YES (group with Task 6)
  - Message: `refactor(cli): update shell completion scripts for new command structure`
  - Files: `src/commands/completion.ts`
  - Pre-commit: `bun run typecheck`

---

- [ ] 6. Rewrite help.ts with new command structure

  **What to do**:
  - Rewrite the `HELP_TEXT` constant in `src/commands/help.ts`
  - New structure should reflect the new root-level groups:
    ```
    Top-level commands:
      help, completion, login, ws-token, credit-lines

    Root groups:
      market      — Market data and platform status
      balance     — Account balance queries
      deposit     — Deposit addresses and refunds
      withdraw    — Crypto and fiat withdrawals
      transfer    — Internal account transfers
      codes       — Redemption codes
      earn        — Staking and yield (fixed, flex, interest)
      trade       — Spot, collateral, and convert trading
      sub-account — Sub-account management
      config      — CLI configuration
    ```
  - Update examples to use new command paths (e.g., `whitebit earn flex invest` not `whitebit account flex-invest`)

  **Must NOT do**:
  - Do NOT change the `helpCommand` defineCommand structure
  - Do NOT add commands that don't exist

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, text-only change
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 7
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `src/commands/help.ts:3-43` — Current help text format and structure

  **Acceptance Criteria**:

  - [ ] Help text contains all new group names: `balance`, `deposit`, `withdraw`, `transfer`, `codes`, `earn`, `credit-lines`, `ws-token`
  - [ ] Help text does NOT contain `account` as a group (old group removed)
  - [ ] Help text does NOT contain `pool` as a group
  - [ ] Examples use new command paths

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Help output shows new groups
    Tool: Bash
    Steps:
      1. bun src/cli.ts help 2>&1
      2. Assert: output contains "balance", "deposit", "withdraw", "transfer", "codes", "earn"
      3. Assert: output does NOT contain "account" as a group name
    Expected Result: Help reflects new structure
    Evidence: Help output captured
  ```

  **Commit**: YES (group with Task 5)
  - Message: `refactor(cli): update help text for new command groups`
  - Files: `src/commands/help.ts`
  - Pre-commit: `bun run typecheck`

---

- [ ] 7. Update and add group nesting tests

  **What to do**:
  - Update `test/commands/trade/nesting.test.ts` — should still pass as-is since trade group is unchanged, but verify imports still resolve
  - Create new test file `test/commands/groups/nesting.test.ts` (or similar) that tests:
    - `balanceGroup` has correct name, description, and command count (3)
    - `depositGroup` has correct name, description, and command count (4)
    - `withdrawGroup` has correct name, description, and command count (4)
    - `transferGroup` has correct name, description, and command count (1)
    - `codesGroup` has correct name, description, and command count (4)
    - `earnGroup` has correct name, description, and contains 3 entries (fixedGroup, flexGroup, interestHistoryCommand)
    - `fixedGroup` has correct name and command count (4)
    - `flexGroup` has correct name and command count (8)
    - `marketGroup` has updated command count (16: original 12 + server-time + status + mining-pool + mining-hashrate)
  - Update `test/commands/completion.test.ts` — verify it still passes with new structure (check what it tests)
  - Update test import paths in `test/commands/account/*.test.ts` (3 files) if their imports reference moved files
  - Ensure `bun test` baseline: 242+ pass, ≤21 fail

  **Must NOT do**:
  - Do NOT fix pre-existing 21 test failures
  - Do NOT change test assertions for command behavior (only group structure)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test file creation/updates following established patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 8)
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Tasks 4, 5, 6

  **References**:

  **Pattern References**:
  - `test/commands/trade/nesting.test.ts:1-56` — Existing group nesting test pattern — follow this exactly for new groups

  **Test References**:
  - `test/commands/account/main-balance.test.ts` — Check if imports reference `src/commands/account/main-balance` (may need path update)
  - `test/commands/account/transfer.test.ts` — Same
  - `test/commands/account/withdraw-crypto.test.ts` — Same
  - `test/commands/completion.test.ts` — May test completion output structure

  **Acceptance Criteria**:

  - [ ] New nesting test file created with tests for all new groups
  - [ ] All group tests pass: correct names, descriptions, command counts
  - [ ] `bun test` shows 242+ pass, ≤21 fail (same or better baseline)
  - [ ] No new test failures introduced

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: All tests pass (baseline check)
    Tool: Bash
    Steps:
      1. bun test 2>&1 | tail -5
      2. Assert: "242 pass" (or more), "21 fail" (or fewer)
    Expected Result: Test baseline maintained
    Evidence: Test output

  Scenario: New nesting tests pass
    Tool: Bash
    Steps:
      1. bun test test/commands/groups/nesting.test.ts 2>&1
      2. Assert: all tests pass
    Expected Result: New group structure tests green
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `test(cli): add group nesting tests for new command structure`
  - Files: New/updated test files
  - Pre-commit: `bun test`

---

- [ ] 8. Update README.md and scripts/run-all-get.sh

  **What to do**:
  - Update `README.md`:
    - Rewrite "Command Reference" section to reflect new group structure
    - Update "Quick Start" examples to use new paths (e.g., `whitebit balance main-balance` not `whitebit account main-balance`)
    - Remove `issue-jwt-token` from documentation
    - Remove phantom commands (`overview`, `rewards`, account `transfer-history`) from documentation
    - Update "Your First Commands" section
    - Remove references to `pool` group
    - Add `earn` group documentation with `fixed`/`flex` subgroups
  - Update `scripts/run-all-get.sh`:
    - Change all `account` command paths to their new group paths:
      - `${WHITEBIT} account balance` → `${WHITEBIT} balance balance`
      - `${WHITEBIT} account main-balance` → `${WHITEBIT} balance main-balance`
      - `${WHITEBIT} account fee` → `${WHITEBIT} balance fee`
      - `${WHITEBIT} account codes-history` → `${WHITEBIT} codes codes-history`
      - `${WHITEBIT} account my-codes` → `${WHITEBIT} codes my-codes`
      - `${WHITEBIT} account plans` → `${WHITEBIT} earn fixed plans`
      - `${WHITEBIT} account investments-history` → `${WHITEBIT} earn fixed investments-history`
      - `${WHITEBIT} account flex-plans` → `${WHITEBIT} earn flex plans`
      - `${WHITEBIT} account flex-investments` → `${WHITEBIT} earn flex investments`
      - `${WHITEBIT} account flex-investment-history` → `${WHITEBIT} earn flex investment-history`
      - `${WHITEBIT} account flex-payment-history` → `${WHITEBIT} earn flex payment-history`
      - `${WHITEBIT} account mining-hashrate` → `${WHITEBIT} market mining-hashrate`
      - `${WHITEBIT} account interest-history` → `${WHITEBIT} earn interest-history`
      - `${WHITEBIT} account credit-lines` → `${WHITEBIT} credit-lines`
      - `${WHITEBIT} account ws-token` → `${WHITEBIT} ws-token`
    - Update section headers to match new groups

  **Must NOT do**:
  - Do NOT document commands that don't exist
  - Do NOT change the script's runner logic or summary formatting

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Documentation and script path updates — straightforward text changes
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 7)
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Task 4

  **References**:

  **File References**:
  - `README.md` — Full file, especially "Command Reference" section
  - `scripts/run-all-get.sh` — Full file (188 lines), all `run_cmd` calls in "Account" section need path updates

  **Acceptance Criteria**:

  - [ ] README contains new group names: `balance`, `deposit`, `withdraw`, `transfer`, `codes`, `earn`
  - [ ] README does NOT reference `account` as a command group
  - [ ] README does NOT reference `issue-jwt-token`
  - [ ] README does NOT reference phantom commands (`overview`, `rewards`, account `transfer-history`)
  - [ ] `scripts/run-all-get.sh` has no references to `account` group paths
  - [ ] Script uses new command paths (earn flex, earn fixed, etc.)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: README reflects new structure
    Tool: Bash
    Steps:
      1. grep -c "whitebit account " README.md
      2. Assert: 0 (no old account group references)
      3. grep -c "whitebit balance\|whitebit earn\|whitebit deposit\|whitebit withdraw\|whitebit codes" README.md
      4. Assert: count > 0
    Expected Result: README uses new group paths
    Evidence: grep counts

  Scenario: Script uses new paths
    Tool: Bash
    Steps:
      1. grep -c "account " scripts/run-all-get.sh
      2. Assert: 0 (no old account group references in commands)
    Expected Result: Script updated
    Evidence: grep count
  ```

  **Commit**: YES
  - Message: `docs(cli): update README and scripts for new command structure`
  - Files: `README.md`, `scripts/run-all-get.sh`
  - Pre-commit: `bun test`

---

## Commit Strategy

| After Task(s) | Message | Key Files | Verification |
|--------------|---------|-----------|--------------|
| 1 | `refactor(cli): move account commands to logical root-level directories` | All moved files | `git status` shows renames |
| 2+3 | `refactor(cli): create barrel files and strip flex prefix` | All index.ts + flex files | `bun run typecheck` |
| 4 | `refactor(cli): register new root-level command groups in cli.ts` | `src/cli.ts` | `bun run typecheck` + `bun src/cli.ts help` |
| 5+6 | `refactor(cli): update completion scripts and help text` | `completion.ts`, `help.ts` | `bun src/cli.ts completion --shell bash` |
| 7 | `test(cli): add group nesting tests for new command structure` | test files | `bun test` |
| 8 | `docs(cli): update README and scripts for new command structure` | `README.md`, `run-all-get.sh` | `bun test` |

---

## Success Criteria

### Verification Commands
```bash
# TypeScript compiles
bun run typecheck        # Expected: zero new errors

# Tests pass (baseline: 242 pass, 21 fail)
bun test                 # Expected: 242+ pass, ≤21 fail

# Lint passes
bun run lint             # Expected: clean

# CLI boots and shows help
bun src/cli.ts help      # Expected: shows new group names

# New groups accessible
bun src/cli.ts balance 2>&1   # Expected: not "unknown command"
bun src/cli.ts earn 2>&1      # Expected: not "unknown command"
bun src/cli.ts deposit 2>&1   # Expected: not "unknown command"

# Completion works
bun src/cli.ts completion --shell bash | grep earn  # Expected: earn found

# Deleted files gone
test ! -f src/commands/account/issue-jwt-token.ts  # Expected: exit 0
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass (baseline maintained)
- [ ] All 27 former account commands accounted for (26 moved + 1 deleted)
- [ ] No orphaned imports or broken references
- [ ] Shell completion works for all 3 shells
- [ ] Help text reflects new structure
