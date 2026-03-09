# Trade Subcommand Nesting — Second-Level Command Depth

## TL;DR

> **Quick Summary**: Restructure the CLI's trading commands from three flat top-level groups (`trade`, `collateral`, `convert`) into a single nested `trade` group with `spot`, `collateral`, and `convert` subgroups. This is a wiring-only refactoring — no command handlers or API layer changes.
>
> **Deliverables**:
> - Nested command hierarchy: `whitebit trade spot|collateral|convert <command>`
> - Removal of `collateral` and `convert` as top-level commands (breaking change)
> - Updated README reflecting accurate command names and new hierarchy
>
> **Estimated Effort**: Short
> **Parallel Execution**: YES — 2 waves
> **Critical Path**: Task 1 (rewire) → Task 3 (tests) | Task 2 (README) is independent

---

## Context

### Original Request
User asked to introduce a second level of depth for commands, giving the example: `whitebit trade collateral`, `whitebit trade spot`, `whitebit trade futures` — with the types to be determined by the implementer.

### Interview Summary
**Key Discussions**:
- **Migration strategy**: Breaking change — remove `collateral` and `convert` as top-level commands, no backward-compatible aliases
- **Futures vs Collateral**: Keep "collateral" naming, no separate "futures" subgroup — WhiteBIT's margin API is accessed via collateral commands
- **Convert placement**: Move `convert` under `trade` as `whitebit trade convert <command>`
- **Test strategy**: Tests after implementation (not TDD)

### Research Findings
- **`@bunli/core` supports nesting natively**: `Group.commands` accepts `Command[]` which is `RunnableCommand | Group` — groups can contain groups
- **`registerCommand` in cli.ts recursively registers nested commands**: `whitebit trade spot limit-order` will work out of the box
- **Tests import handlers directly**: Tests call `command.handler()`, never going through CLI routing — restructuring won't break existing tests
- **README is already out of sync with code**: ~15 README command names don't match actual `name` properties in command files. README sections need full rewrite from source, not find-and-replace

### Metis Review
**Identified Gaps** (addressed):
- **`tradeGroup` naming collision**: Current `trade/index.ts` exports `tradeGroup` with `name: 'trade'`. The parent group also needs `name: 'trade'`. Resolved by renaming current export to `spotGroup` with `name: 'spot'`.
- **Missing parent group description**: New parent `trade` group needs its own description. Applied default: "Trading commands (spot, collateral, convert)".
- **`whitebit trade` behavior change**: Running `whitebit trade` alone now shows subgroups (`spot`, `collateral`, `convert`) instead of spot trading commands. This is expected and desired.
- **File structure decision**: Keep `src/commands/collateral/` and `src/commands/convert/` in their current locations. Do NOT move directories — CLI hierarchy ≠ file hierarchy.
- **README accuracy**: README lists ~15 command names that don't match actual code. Sections must be rewritten from actual `name` properties in source files.

---

## Work Objectives

### Core Objective
Restructure CLI so trading commands are organized under `whitebit trade spot|collateral|convert <command>`, removing `collateral` and `convert` as standalone top-level groups.

### Concrete Deliverables
- Modified `src/commands/trade/index.ts` — spot subgroup + parent trade group with nesting
- Modified `src/cli.ts` — remove standalone `collateralGroup` and `convertGroup` registrations
- Rewritten README trade/collateral/convert sections with accurate command names and nested paths
- New tests validating nested command help output

### Definition of Done
- [ ] `bun run typecheck` passes with exit code 0
- [ ] `bun test` passes with exit code 0
- [ ] `bun run lint` passes with exit code 0
- [ ] `bun src/cli.ts trade spot --help` shows spot commands
- [ ] `bun src/cli.ts trade collateral --help` shows collateral commands
- [ ] `bun src/cli.ts trade convert --help` shows convert commands
- [ ] `bun src/cli.ts trade --help` lists `spot`, `collateral`, `convert` as subcommands
- [ ] `bun src/cli.ts collateral --help` fails (no longer top-level)
- [ ] `bun src/cli.ts convert --help` fails (no longer top-level)

### Must Have
- `whitebit trade spot <cmd>` for all 18 current spot trading commands
- `whitebit trade collateral <cmd>` for all 22 current collateral commands
- `whitebit trade convert <cmd>` for all 3 current convert commands
- `whitebit trade --help` showing the three subgroups
- README accurately reflecting all command names from source code

### Must NOT Have (Guardrails)
- NO backward-compatibility aliases (`whitebit collateral` must NOT work)
- NO directory moves — `src/commands/collateral/` and `src/commands/convert/` stay in their current locations
- NO modifications to individual command handler files (`*.ts` under `trade/`, `collateral/`, `convert/`)
- NO modifications to API layer files (`src/lib/api/`)
- NO renaming "collateral" to "futures" or any other name
- NO modifications to `src/commands/collateral/index.ts` or `src/commands/convert/index.ts` — their exports remain unchanged
- NO new abstractions, utility functions, or shared modules beyond the group wiring
- NO JSDoc additions or inline documentation beyond what exists
- NO modifications to `package.json`, CI config, or Homebrew formula

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: YES (tests after)
- **Framework**: bun test

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| CLI restructuring | Bash (bun src/cli.ts) | Run CLI commands, check help output, verify routing |
| TypeScript compilation | Bash (bun run typecheck) | Check exit code 0 |
| Tests | Bash (bun test) | Run test suite, verify all pass |
| README | Bash (grep/read) | Verify README contains correct nested paths |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Rewire command registration (spot/collateral/convert under trade)
└── Task 2: Rewrite README trade/collateral/convert sections

Wave 2 (After Wave 1):
└── Task 3: Add tests for nested command structure

Critical Path: Task 1 → Task 3
Parallel Speedup: Task 2 can run alongside Task 1
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | None | 1 |
| 3 | 1 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | Task 1: quick (minimal code changes), Task 2: writing (README rewrite) |
| 2 | 3 | quick (simple test additions) |

---

## TODOs

- [ ] 1. Rewire command registration — nest spot/collateral/convert under trade

  **What to do**:
  1. In `src/commands/trade/index.ts`:
     - Rename the existing `tradeGroup` export to `spotGroup`
     - Change `name: 'trade'` to `name: 'spot'`
     - Change `description: 'Spot trading commands'` to `description: 'Spot order management'`
     - Import `collateralGroup` from `../collateral`
     - Import `convertGroup` from `../convert`
     - Create a new `tradeGroup` export using `defineGroup` with:
       - `name: 'trade'`
       - `description: 'Trading commands (spot, collateral, convert)'`
       - `commands: [spotGroup, collateralGroup, convertGroup]`
  2. In `src/cli.ts`:
     - Remove the import of `collateralGroup` from `'./commands/collateral'` (line 39)
     - Remove the import of `convertGroup` from `'./commands/convert'` (line 42)
     - Remove `cli.command(collateralGroup)` (line 274)
     - Remove `cli.command(convertGroup)` (line 275)
     - The `tradeGroup` import (line 59) stays — it now refers to the new parent group

  **Must NOT do**:
  - Do not modify any individual command files
  - Do not move `src/commands/collateral/` or `src/commands/convert/` directories
  - Do not modify `src/commands/collateral/index.ts` or `src/commands/convert/index.ts`
  - Do not add backward-compatibility aliases
  - Do not create new directories

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Only 2 files change, modifications are straightforward group wiring
  - **Skills**: [`git-master`]
    - `git-master`: Needed for committing the changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `src/commands/trade/index.ts:22-45` — Current `defineGroup` pattern showing how groups are defined with `name`, `description`, `commands` array. This file will be modified.
  - `src/commands/collateral/index.ts:26-53` — Current `collateralGroup` export showing group definition. Import this export into trade/index.ts.
  - `src/commands/convert/index.ts:7-11` — Current `convertGroup` export showing group definition. Import this export into trade/index.ts.
  - `src/cli.ts:265-278` — How groups are registered via `cli.command()`. Remove `collateralGroup` and `convertGroup` from here.

  **API/Type References**:
  - `node_modules/@bunli/core/src/types.ts:132-137` — `Group` type definition showing `commands: Command<any, TStore, any>[]` — confirms groups can nest inside groups.
  - `node_modules/@bunli/core/src/types.ts:139-141` — `Command` type is `RunnableCommand | Group` — confirms `defineGroup` result can be placed in another group's `commands`.
  - `node_modules/@bunli/core/src/types.ts:228-232` — `defineGroup` function signature.

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: TypeScript compiles cleanly after rewiring
    Tool: Bash
    Preconditions: Dependencies installed (node_modules present)
    Steps:
      1. Run: bun run typecheck
      2. Assert: Exit code is 0
      3. Assert: No error output
    Expected Result: Type-check passes with zero errors
    Evidence: stdout/stderr captured

  Scenario: All existing tests pass (handlers unchanged)
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run: bun test
      2. Assert: Exit code is 0
      3. Assert: Output shows all tests passed
    Expected Result: Zero test failures
    Evidence: Test output captured

  Scenario: Lint passes after changes
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run: bun run lint
      2. Assert: Exit code is 0
    Expected Result: No lint errors
    Evidence: stdout captured

  Scenario: Spot commands accessible under trade spot
    Tool: Bash
    Preconditions: Source files modified
    Steps:
      1. Run: bun src/cli.ts trade spot --help
      2. Assert: Output contains "limit-order"
      3. Assert: Output contains "market-order"
      4. Assert: Output contains "cancel"
      5. Assert: Output contains "bulk-order"
    Expected Result: All 18 spot commands listed under trade spot
    Evidence: Help output captured

  Scenario: Collateral commands accessible under trade collateral
    Tool: Bash
    Preconditions: Source files modified
    Steps:
      1. Run: bun src/cli.ts trade collateral --help
      2. Assert: Output contains "balance"
      3. Assert: Output contains "limit-order"
      4. Assert: Output contains "open-positions"
      5. Assert: Output contains "create-oco"
    Expected Result: All 22 collateral commands listed under trade collateral
    Evidence: Help output captured

  Scenario: Convert commands accessible under trade convert
    Tool: Bash
    Preconditions: Source files modified
    Steps:
      1. Run: bun src/cli.ts trade convert --help
      2. Assert: Output contains "estimate"
      3. Assert: Output contains "confirm"
      4. Assert: Output contains "history"
    Expected Result: All 3 convert commands listed under trade convert
    Evidence: Help output captured

  Scenario: Parent trade group shows subgroups
    Tool: Bash
    Preconditions: Source files modified
    Steps:
      1. Run: bun src/cli.ts trade --help
      2. Assert: Output contains "spot"
      3. Assert: Output contains "collateral"
      4. Assert: Output contains "convert"
    Expected Result: Three subgroups listed
    Evidence: Help output captured

  Scenario: Old top-level collateral path no longer works
    Tool: Bash
    Preconditions: Source files modified
    Steps:
      1. Run: bun src/cli.ts collateral --help 2>&1; echo "EXIT:$?"
      2. Assert: Output contains "Unknown command" OR exit code is non-zero
    Expected Result: Command not found
    Evidence: Output captured

  Scenario: Old top-level convert path no longer works
    Tool: Bash
    Preconditions: Source files modified
    Steps:
      1. Run: bun src/cli.ts convert --help 2>&1; echo "EXIT:$?"
      2. Assert: Output contains "Unknown command" OR exit code is non-zero
    Expected Result: Command not found
    Evidence: Output captured

  Scenario: Specific nested command help works (trade spot limit-order)
    Tool: Bash
    Preconditions: Source files modified
    Steps:
      1. Run: bun src/cli.ts trade spot limit-order --help
      2. Assert: Output contains "--market"
      3. Assert: Output contains "--side"
      4. Assert: Output contains "--price"
      5. Assert: Output contains "--amount"
    Expected Result: Full command help with all flags shown
    Evidence: Help output captured
  ```

  **Commit**: YES
  - Message: `refactor(trade): nest spot, collateral, and convert commands under trade group`
  - Files: `src/commands/trade/index.ts`, `src/cli.ts`
  - Pre-commit: `bun run typecheck && bun test && bun run lint`

---

- [ ] 2. Rewrite README trade/collateral/convert sections

  **What to do**:
  1. Replace the "Trading (Requires Auth)" section with a "Trading (Requires Auth)" parent section containing three subsections:
     - **Spot Trading** (`trade spot <command>`) — list all 18 actual command names with descriptions from source:
       - `trade spot limit-order` — Create a limit order
       - `trade spot market-order` — Create a market order
       - `trade spot bulk-order` — Create multiple orders in bulk
       - `trade spot stop-limit` — Create a stop-limit order
       - `trade spot stop-market` — Create a stop-market order
       - `trade spot buy-stock` — Create a buy stock market order (buy for fixed money amount)
       - `trade spot cancel` — Cancel a specific order
       - `trade spot cancel-all` — Cancel all orders (optionally filtered by market)
       - `trade spot modify` — Modify an existing order
       - `trade spot executed` — List executed orders
       - `trade spot unexecuted` — List unexecuted (open) orders
       - `trade spot deals` — Get executed deals for a specific order
       - `trade spot history` — Get trades history
       - `trade spot balance` — Get trade balance for all assets
       - `trade spot fee` — Get trading fee for a specific market
       - `trade spot all-fees` — Get trading fees for all markets
       - `trade spot kill-switch-status` — Get kill switch status
       - `trade spot kill-switch-sync` — Sync kill switch timer
     - **Collateral Trading** (`trade collateral <command>`) — list all 22 actual command names:
       - `trade collateral balance` — Fetch collateral account balance
       - `trade collateral summary` — Fetch collateral account summary
       - `trade collateral balance-summary` — Fetch collateral account balance summary with detailed asset breakdown
       - `trade collateral hedge-mode` — Get collateral account hedge mode status
       - `trade collateral set-hedge-mode` — Update collateral account hedge mode
       - `trade collateral limit-order` — Create a collateral limit order
       - `trade collateral market-order` — Create a collateral market order
       - `trade collateral bulk-order` — Create multiple collateral limit orders
       - `trade collateral stop-limit` — Create a collateral stop-limit order
       - `trade collateral trigger-market` — Create a collateral trigger market order
       - `trade collateral set-leverage` — Set leverage for a collateral market
       - `trade collateral close-position` — Close a collateral position
       - `trade collateral open-positions` — Get all open collateral positions
       - `trade collateral position-history` — Get collateral positions history
       - `trade collateral funding-history` — Get collateral funding history
       - `trade collateral conditional-orders` — Get unexecuted conditional orders
       - `trade collateral cancel-conditional` — Cancel a conditional order
       - `trade collateral oco-orders` — Get unexecuted OCO orders
       - `trade collateral create-oco` — Create an OCO (One-Cancels-Other) order
       - `trade collateral create-oto` — Create an OTO (One-Triggers-Other) order
       - `trade collateral cancel-oco` — Cancel an OCO order
       - `trade collateral cancel-oto` — Cancel an OTO order
     - **Convert** (`trade convert <command>`) — list all 3 actual command names:
       - `trade convert estimate` — Estimate conversion rate and amount
       - `trade convert confirm` — Confirm and execute a conversion
       - `trade convert history` — Get conversion history
  2. Remove the standalone "Collateral Trading (Requires Auth)" section entirely
  3. Remove the standalone "Convert (Requires Auth)" section entirely
  4. Update the "Quick Start" section's trading examples to use new nested paths:
     - `whitebit trade spot unexecuted` (was `whitebit trade active-orders`)
     - `whitebit trade spot limit-order` (was `whitebit trade create-limit`)
  5. Update the "Examples" section at the bottom:
     - `whitebit trade spot limit-order -m BTC_USDT -s buy -p 50000 -a 0.001` (was `whitebit trade create-limit BTC_USDT buy 50000 0.001`)

  **Must NOT do**:
  - Do not invent command names — use ONLY the `name` properties from the actual source files listed above
  - Do not add command descriptions that don't match the `description` properties from source
  - Do not add documentation about features that don't exist
  - Do not restructure non-trading sections of the README (market, account, sub-account, config)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: This is primarily a documentation rewrite task with exact content replacement
  - **Skills**: [`git-master`]
    - `git-master`: Needed for committing the changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Source of Truth for Command Names**:
  - `src/commands/trade/*.ts` — Each file's `name: '...'` and `description: '...'` properties define the canonical command name and description. There are 18 spot commands.
  - `src/commands/collateral/*.ts` — Each file's `name` and `description` properties. There are 22 collateral commands.
  - `src/commands/convert/*.ts` — Each file's `name` and `description` properties. There are 3 convert commands.
  - The complete list of all command names with descriptions is provided in the "What to do" section above — these were extracted directly from grep of the source files.

  **File to Modify**:
  - `README.md` — The README file at the project root. Sections to modify: "Your First Commands" (~line 80), "Trading (Requires Auth)" (~line 147), "Collateral Trading (Requires Auth)" (~line 161), "Convert (Requires Auth)" (~line 174), "Examples" section (~line 220).

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: README contains nested trade spot commands
    Tool: Bash (grep)
    Preconditions: README.md has been modified
    Steps:
      1. grep "trade spot limit-order" README.md
      2. Assert: Match found
      3. grep "trade spot market-order" README.md
      4. Assert: Match found
      5. grep "trade spot cancel" README.md
      6. Assert: Match found
    Expected Result: All spot commands use "trade spot" prefix
    Evidence: Grep output captured

  Scenario: README contains nested trade collateral commands
    Tool: Bash (grep)
    Preconditions: README.md has been modified
    Steps:
      1. grep "trade collateral balance" README.md
      2. Assert: Match found
      3. grep "trade collateral limit-order" README.md
      4. Assert: Match found
      5. grep "trade collateral open-positions" README.md
      6. Assert: Match found
    Expected Result: All collateral commands use "trade collateral" prefix
    Evidence: Grep output captured

  Scenario: README contains nested trade convert commands
    Tool: Bash (grep)
    Preconditions: README.md has been modified
    Steps:
      1. grep "trade convert estimate" README.md
      2. Assert: Match found
      3. grep "trade convert confirm" README.md
      4. Assert: Match found
      5. grep "trade convert history" README.md
      6. Assert: Match found
    Expected Result: All convert commands use "trade convert" prefix
    Evidence: Grep output captured

  Scenario: Old standalone collateral section removed
    Tool: Bash (grep)
    Preconditions: README.md has been modified
    Steps:
      1. grep -c "### Collateral Trading" README.md
      2. Assert: Count is 0 (no standalone section header)
      3. grep -c "^- \`collateral " README.md
      4. Assert: Count is 0 (no top-level collateral command references)
    Expected Result: No standalone collateral section exists
    Evidence: Grep output captured

  Scenario: Old standalone convert section removed
    Tool: Bash (grep)
    Preconditions: README.md has been modified
    Steps:
      1. grep -c "### Convert" README.md
      2. Assert: Count is 0 (no standalone section header)
      3. grep -c "^- \`convert " README.md
      4. Assert: Count is 0 (no top-level convert command references)
    Expected Result: No standalone convert section exists
    Evidence: Grep output captured

  Scenario: Quick Start examples use new nested paths
    Tool: Bash (grep)
    Preconditions: README.md has been modified
    Steps:
      1. grep "trade spot" README.md
      2. Assert: At least one match found in Quick Start area
      3. grep -c "whitebit trade create-limit" README.md
      4. Assert: Count is 0 (old command name removed)
    Expected Result: Quick Start reflects new command paths
    Evidence: Grep output captured
  ```

  **Commit**: YES
  - Message: `docs: update README for nested trade command structure`
  - Files: `README.md`
  - Pre-commit: None (documentation only)

---

- [ ] 3. Add tests for nested command structure

  **What to do**:
  1. Create a test file (e.g., `test/commands/trade/nesting.test.ts`) that verifies:
     - The exported `tradeGroup` from `src/commands/trade/index.ts` has `name: 'trade'`
     - The `tradeGroup.commands` array contains exactly 3 subgroups
     - The subgroups have names `spot`, `collateral`, `convert`
     - The `spot` subgroup contains the expected number of commands (18)
     - The `collateral` subgroup contains the expected number of commands (22)
     - The `convert` subgroup contains the expected number of commands (3)
  2. Follow the existing test patterns in the `test/` directory for structure and imports.

  **Must NOT do**:
  - Do not add tests for individual command handlers (those already exist)
  - Do not add E2E/integration tests that hit the WhiteBIT API
  - Do not modify existing test files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple structural test — just verifying group nesting, no complex logic
  - **Skills**: [`git-master`]
    - `git-master`: Needed for committing the changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Task 1)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 1 (needs the restructured exports to test against)

  **References** (CRITICAL):

  **Pattern References** (existing tests to follow):
  - `test/commands/trade/` — Existing trade test directory. New test file goes here.
  - `test/setup.ts` — Test setup file, check if it needs to be imported.

  **API/Type References**:
  - `src/commands/trade/index.ts` — The modified file exporting `tradeGroup` and `spotGroup`. Test imports from here.
  - `node_modules/@bunli/core/src/types.ts:132-137` — `Group` type for type-safe assertions.

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Nesting tests pass
    Tool: Bash
    Preconditions: Task 1 completed, test file created
    Steps:
      1. Run: bun test test/commands/trade/nesting.test.ts
      2. Assert: Exit code is 0
      3. Assert: Output shows all tests passed
    Expected Result: All nesting structure tests pass
    Evidence: Test output captured

  Scenario: Full test suite still passes with new tests
    Tool: Bash
    Preconditions: Test file created
    Steps:
      1. Run: bun test
      2. Assert: Exit code is 0
      3. Assert: Output shows all tests passed (including new ones)
    Expected Result: Zero failures across entire test suite
    Evidence: Test output captured
  ```

  **Commit**: YES (groups with Task 1 commit or separate)
  - Message: `test(trade): add tests for nested command group structure`
  - Files: `test/commands/trade/nesting.test.ts`
  - Pre-commit: `bun test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `refactor(trade): nest spot, collateral, and convert commands under trade group` | `src/commands/trade/index.ts`, `src/cli.ts` | `bun run typecheck && bun test && bun run lint` |
| 2 | `docs: update README for nested trade command structure` | `README.md` | N/A (docs) |
| 3 | `test(trade): add tests for nested command group structure` | `test/commands/trade/nesting.test.ts` | `bun test` |

---

## Success Criteria

### Verification Commands
```bash
bun run typecheck    # Expected: exit code 0
bun test             # Expected: all tests pass
bun run lint         # Expected: exit code 0
bun run build        # Expected: exit code 0, dist/whitebit created

# Nested commands work
bun src/cli.ts trade --help               # Expected: lists spot, collateral, convert
bun src/cli.ts trade spot --help           # Expected: lists 18 spot commands
bun src/cli.ts trade collateral --help     # Expected: lists 22 collateral commands
bun src/cli.ts trade convert --help        # Expected: lists 3 convert commands
bun src/cli.ts trade spot limit-order --help  # Expected: shows limit-order flags

# Old paths removed
bun src/cli.ts collateral --help 2>&1      # Expected: "Unknown command"
bun src/cli.ts convert --help 2>&1         # Expected: "Unknown command"
```

### Final Checklist
- [ ] All 18 spot commands accessible via `trade spot <cmd>`
- [ ] All 22 collateral commands accessible via `trade collateral <cmd>`
- [ ] All 3 convert commands accessible via `trade convert <cmd>`
- [ ] `whitebit trade` shows three subgroups
- [ ] `whitebit collateral` and `whitebit convert` no longer work as top-level
- [ ] README command names match actual source code `name` properties
- [ ] All existing tests pass unchanged
- [ ] TypeScript compiles, lint passes, build succeeds
