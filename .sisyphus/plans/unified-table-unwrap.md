# Unified Table Wrapper Unwrapping

## TL;DR

> **Quick Summary**: Create a single `unwrapTableData()` helper function that extracts inner arrays from API response wrappers (`{ data: [...] }` or `{ records: [...] }`) for table display, and apply it consistently across all ~16 command files that have this problem.
> 
> **Deliverables**:
> - One new exported function `unwrapTableData` in `src/lib/formatter.ts`
> - One new test file `test/lib/unwrap-table-data.test.ts`
> - 16 command files updated to use the helper
> - 3 existing inline extraction patterns replaced with helper calls
> 
> **Estimated Effort**: Short
> **Parallel Execution**: NO — sequential (foundation first, then application)
> **Critical Path**: Task 1 (helper + test) → Task 2 (refactor inline) → Task 3 (add to broken commands)

---

## Context

### Original Request
Many API endpoints return wrapper objects like `{ data: [...], limit, offset }` or `{ records: [...], limit, offset, total }`. When rendered in table mode, the formatter treats these wrappers as single objects and shows one row with truncated JSON in the `data`/`records` column. The user wants each item inside the array to be a table row instead.

Three files already have inline extraction code (codes-history, my-codes, sub-account list) that duplicates a 6-line pattern. The user wants this unified into a single helper.

### Interview Summary
**Key Discussions**:
- User confirmed the problem on `investments-history`, `flex-plans`, `flex-investments`, `flex-investment-history`
- User wants unified approach: "make sure that all our implementation is unified and we dont slop around the code"
- Sub-account list has nested `data.data` — user says "skip it for now display it as is"
- JSON output must remain unchanged

**Research Findings**:
- The formatter's `collectRows()` treats any object as a single row — this is correct behavior; the fix belongs in command files, not the formatter
- Type annotations in API classes are wrong for some methods (e.g., `flexPlans()` says `Promise<FlexibleInvestmentPlan[]>` but actually returns `{ data: [...] }`) — fixing types is OUT OF SCOPE
- `unwrapWhitebitPayload()` in market helpers serves a different purpose (unconditional unwrapping for public API quirks) and must NOT be modified
- Wrapper shapes confirmed from type definitions: `records` wrapper has `{ records: Array, limit, offset, total }`; `data` wrapper has `{ data: Array }` sometimes with `limit`/`offset`

### Metis Review
**Identified Gaps** (addressed):
- Helper must only unwrap when inner value is an Array (not when `.data` is a string or object) — addressed in acceptance criteria
- Helper location should be `src/lib/formatter.ts` (colocated with formatting) not market helpers — adopted
- Some files have unknown wrapper shapes (plans, credit-lines, collateral position/funding history) — helper is a safe no-op if no wrapper exists
- Pattern must be call-site unwrapping: `runtimeConfig.format === 'table' ? unwrapTableData(response) : response` — keeps JSON output intact

---

## Work Objectives

### Core Objective
Eliminate duplicated wrapper-extraction code and fix all commands where wrapper responses render as single table rows, using one shared helper function.

### Concrete Deliverables
- `unwrapTableData()` function exported from `src/lib/formatter.ts`
- Unit test file `test/lib/unwrap-table-data.test.ts`
- 16 command files using the helper consistently

### Definition of Done
- [ ] `bun test` — all tests pass (existing + new)
- [ ] `bun run build` — build succeeds
- [ ] Zero inline wrapper extraction code remains (no more `'data' in response ? (response as Record<string, unknown>).data : response` patterns)
- [ ] JSON output unchanged for all affected commands

### Must Have
- Single helper function handles both `.data` and `.records` wrapper shapes
- Only unwraps when the inner value is an Array
- Applied to all 16 identified command files
- Unit tests for the helper function

### Must NOT Have (Guardrails)
- Do NOT modify `formatOutput()`, `renderTable()`, `collectRows()`, or any existing formatter logic
- Do NOT modify any API class files (`src/lib/api/*.ts`) or fix type annotations
- Do NOT modify any type definition files (`src/lib/types/*.ts`)
- Do NOT modify or extend `unwrapWhitebitPayload` in `src/commands/market/helpers.ts`
- Do NOT change JSON output behavior
- Do NOT refactor collateral commands from `authenticatedPost` to `CollateralApi`
- Do NOT add pagination display (e.g., "page 1 of 10")
- Do NOT fix the sub-account list `data.data` nesting — display as-is

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: YES (tests-after for the helper, no TDD)
- **Framework**: bun test

---

## TODOs

- [ ] 1. Create `unwrapTableData` helper function and unit tests

  **What to do**:
  - Add `unwrapTableData(data: unknown): unknown` function to `src/lib/formatter.ts`
  - The function checks:
    1. If `data` is a non-null object and has a `.records` property that is an Array → return `.records`
    2. If `data` is a non-null object and has a `.data` property that is an Array → return `.data`
    3. Otherwise return `data` unchanged
  - Check `.records` BEFORE `.data` (since `records` is the more specific/explicit wrapper key used by the API — prevents false positives on responses where `.data` might mean something else)
  - Export the function alongside existing exports
  - Create `test/lib/unwrap-table-data.test.ts` with test cases:
    1. `{ data: [{a:1}], limit: 10 }` → returns `[{a:1}]`
    2. `{ records: [{b:2}], total: 5 }` → returns `[{b:2}]`
    3. `[{c:3}]` (plain array) → returns `[{c:3}]` unchanged
    4. `{ id: 1, name: "foo" }` (flat object, no wrapper) → returns unchanged
    5. `{ data: "not-array" }` → returns unchanged (only unwrap arrays)
    6. `{ records: "not-array" }` → returns unchanged
    7. `null` → returns `null`
    8. `undefined` → returns `undefined`
    9. `{ data: [] }` → returns `[]` (empty array still unwraps)
    10. `{ records: [], limit: 100, offset: 0, total: 0 }` → returns `[]`

  **Must NOT do**:
  - Do NOT modify any existing functions in `formatter.ts`
  - Do NOT make the function format-aware (no `runtimeConfig` parameter)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]
    - `git-master`: For committing the changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — must complete first
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/lib/formatter.ts:23-24` — existing `isRecord()` helper that checks `typeof value === 'object' && value !== null && !Array.isArray(value)` — reuse this for the wrapper check
  - `src/lib/formatter.ts:50-66` — existing `flattenRow()` as example of a pure utility function in this file
  - `src/lib/formatter.ts:147-154` — `formatOutput()` function — the new helper will be called before this, not inside it

  **Test References**:
  - `test/lib/formatter.test.ts` — existing test file pattern to follow for test structure and imports

  **Acceptance Criteria**:
  - [ ] `unwrapTableData` is exported from `src/lib/formatter.ts`
  - [ ] Function signature is `(data: unknown): unknown`
  - [ ] `bun test test/lib/unwrap-table-data.test.ts` → PASS (10 tests, 0 failures)
  - [ ] `bun test` → all existing tests still pass
  - [ ] `bun run build` → build succeeds

  **Commit**: YES
  - Message: `feat(formatter): add unwrapTableData helper for extracting arrays from API response wrappers`
  - Files: `src/lib/formatter.ts`, `test/lib/unwrap-table-data.test.ts`
  - Pre-commit: `bun test`

---

- [ ] 2. Refactor existing inline extraction to use `unwrapTableData`

  **What to do**:
  - Update 3 files that already have inline `data` extraction to use the new helper
  - In each file:
    - Add import: `import { formatOutput, unwrapTableData } from '../../lib/formatter';` (modify existing import)
    - Replace the inline extraction block with: `const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;`
    - Then: `formatOutput(data, { format: runtimeConfig.format });`

  **Files to change**:

  1. `src/commands/account/codes-history.ts` — Replace lines 42-49:
     ```
     // FROM (6 lines):
     const data =
       runtimeConfig.format === 'table' &&
       response && typeof response === 'object' && 'data' in response
         ? (response as Record<string, unknown>).data
         : response;
     formatOutput(data, { format: runtimeConfig.format });

     // TO (2 lines):
     const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;
     formatOutput(data, { format: runtimeConfig.format });
     ```

  2. `src/commands/account/my-codes.ts` — Same transformation as codes-history (lines 42-49)

  3. `src/commands/sub-account/list.ts` — Replace lines 26-30:
     ```
     // FROM:
     const data =
       runtimeConfig.format === 'table' && result && typeof result === 'object' && 'data' in result
         ? (result as Record<string, unknown>).data
         : result;
     formatOutput(data, { format: runtimeConfig.format });

     // TO:
     const data = runtimeConfig.format === 'table' ? unwrapTableData(result) : result;
     formatOutput(data, { format: runtimeConfig.format });
     ```
     Note: This file uses `result` variable name instead of `response`.

  **Must NOT do**:
  - Do NOT change the variable naming convention used in each file (`response` vs `result`)
  - Do NOT change any logic beyond the extraction pattern
  - Do NOT touch the sub-account list `data.data` nesting behavior — the helper naturally handles one level of unwrapping, which is correct

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — after Task 1
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/commands/account/codes-history.ts:42-49` — existing inline extraction to replace
  - `src/commands/account/my-codes.ts:42-49` — identical pattern to replace
  - `src/commands/sub-account/list.ts:26-30` — same pattern with `result` variable name

  **Acceptance Criteria**:
  - [ ] Zero occurrences of `(response as Record<string, unknown>).data` or `(result as Record<string, unknown>).data` remain in codebase
  - [ ] All 3 files import `unwrapTableData` from `../../lib/formatter`
  - [ ] `bun test` → all tests pass
  - [ ] `bun run build` → build succeeds

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify no inline extraction remains
    Tool: Bash (grep)
    Steps:
      1. grep -r "as Record<string, unknown>).data" src/commands/
      2. Assert: zero matches
    Expected Result: No inline extraction patterns remain
  ```

  **Commit**: YES
  - Message: `refactor(commands): replace inline wrapper extraction with unwrapTableData helper`
  - Files: `src/commands/account/codes-history.ts`, `src/commands/account/my-codes.ts`, `src/commands/sub-account/list.ts`
  - Pre-commit: `bun test`

---

- [ ] 3. Add `unwrapTableData` to all command files with broken table formatting

  **What to do**:
  - Update 13 command files that currently pass wrapper responses directly to `formatOutput`
  - In each file:
    - Modify the formatter import to include `unwrapTableData`: `import { formatOutput, unwrapTableData } from '../../lib/formatter';`
    - Replace `formatOutput(response, { format: runtimeConfig.format });` with:
      ```typescript
      const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;
      formatOutput(data, { format: runtimeConfig.format });
      ```
    - For collateral commands that use `../../lib/formatter` path — same pattern

  **Files to change (Group B — confirmed wrapper types from type definitions)**:

  1. `src/commands/account/investments-history.ts` — line 42 — `{ records: [...], limit, offset, total }`
  2. `src/commands/account/flex-investment-history.ts` — line 42 — `{ data: [...], limit, offset }` (runtime) 
  3. `src/commands/account/flex-payment-history.ts` — line 42 — wrapper shape
  4. `src/commands/account/interest-history.ts` — line 42 — `{ records: [...], limit, offset, total }`
  5. `src/commands/account/withdraw-history.ts` — line 42 — `{ records: [...], limit, offset, total }`
  6. `src/commands/account/flex-plans.ts` — line 28 — `{ data: [...] }` (runtime)
  7. `src/commands/account/flex-investments.ts` — line 28 — `{ data: [...], limit, offset }` (runtime)
  8. `src/commands/convert/history.ts` — line 41 — `{ records: [...], total }`

  **Files to change (Group C — unknown wrapper shape, helper is safe no-op)**:

  9. `src/commands/account/plans.ts` — line 28
  10. `src/commands/account/credit-lines.ts` — line 28
  11. `src/commands/sub-account/transfer-history.ts` — line 40
  12. `src/commands/collateral/position-history.ts` — line 42
  13. `src/commands/collateral/funding-history.ts` — line 42

  **Must NOT do**:
  - Do NOT modify any logic beyond adding the unwrap call
  - Do NOT change variable names used in each file
  - Do NOT add extra logic for specific response shapes
  - Do NOT modify collateral commands to use CollateralApi class

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — after Task 2
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - After Task 2, `src/commands/account/codes-history.ts` will have the canonical pattern to follow:
    ```typescript
    import { formatOutput, unwrapTableData } from '../../lib/formatter';
    // ...
    const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;
    formatOutput(data, { format: runtimeConfig.format });
    ```

  **Type References** (confirming wrapper shapes):
  - `src/lib/types/account.ts:102-109` — `WithdrawHistoryResponse` with `{ records, limit, offset, total }`
  - `src/lib/types/account.ts:185-192` — `InvestmentsHistoryResponse` with `{ records, limit, offset, total }`
  - `src/lib/types/account.ts:235-242` — `FlexInvestmentHistoryResponse` with `{ records, limit, offset, total }`
  - `src/lib/types/account.ts:254-261` — `InterestPaymentsHistoryResponse` with `{ records, limit, offset, total }`
  - `src/lib/types/convert.ts:50-53` — `ConvertHistoryResponse` with `{ records, total }`

  **Acceptance Criteria**:
  - [ ] All 13 files import `unwrapTableData` from formatter
  - [ ] All 13 files use the `runtimeConfig.format === 'table' ? unwrapTableData(response) : response` pattern
  - [ ] `bun test` → all tests pass
  - [ ] `bun run build` → build succeeds

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify all affected files use unwrapTableData
    Tool: Bash (grep)
    Steps:
      1. For each file in the list, grep for "unwrapTableData" 
      2. Assert: each file contains the import and usage
      3. grep -rn "formatOutput(response," src/commands/account/investments-history.ts src/commands/account/flex-plans.ts src/commands/account/flex-investments.ts src/commands/account/flex-investment-history.ts src/commands/account/flex-payment-history.ts src/commands/account/interest-history.ts src/commands/account/withdraw-history.ts src/commands/account/plans.ts src/commands/account/credit-lines.ts src/commands/convert/history.ts src/commands/sub-account/transfer-history.ts src/commands/collateral/position-history.ts src/commands/collateral/funding-history.ts
      4. Assert: zero matches (no direct `formatOutput(response,` without unwrapping)
    Expected Result: All files use the helper
  ```

  ```
  Scenario: Verify build and tests pass
    Tool: Bash
    Steps:
      1. bun test
      2. Assert: all tests pass
      3. bun run build
      4. Assert: build succeeds
    Expected Result: No regressions
  ```

  **Commit**: YES
  - Message: `fix(commands): add unwrapTableData to all commands with wrapper response table formatting`
  - Files: all 13 command files listed above
  - Pre-commit: `bun test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(formatter): add unwrapTableData helper for extracting arrays from API response wrappers` | `src/lib/formatter.ts`, `test/lib/unwrap-table-data.test.ts` | `bun test` |
| 2 | `refactor(commands): replace inline wrapper extraction with unwrapTableData helper` | 3 command files | `bun test` |
| 3 | `fix(commands): add unwrapTableData to all commands with wrapper response table formatting` | 13 command files | `bun test && bun run build` |

---

## Success Criteria

### Verification Commands
```bash
bun test                    # All tests pass including new test file
bun run build               # Build succeeds
grep -r "as Record<string, unknown>).data" src/commands/  # Zero matches (no inline extraction left)
grep -r "as Record<string, unknown>).records" src/commands/  # Zero matches
```

### Final Checklist
- [ ] `unwrapTableData` exported from `src/lib/formatter.ts`
- [ ] 10 unit tests pass for the helper
- [ ] 3 files refactored from inline extraction to helper
- [ ] 13 files added with helper where wrapper was passed through
- [ ] Zero inline extraction patterns remain in `src/commands/`
- [ ] All existing tests pass
- [ ] Build succeeds
- [ ] JSON output unchanged (wrapper preserved in JSON mode)
