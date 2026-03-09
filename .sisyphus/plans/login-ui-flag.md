# Login `--ui` Flag: Interactive Web-Based Credential Input

## TL;DR

> **Quick Summary**: Add a `--ui` boolean flag to the `whitebit login` command that spawns a local `Bun.serve()` web server with a static HTML credential form. Credentials are entered in the browser and never appear in terminal history or LLM context. The executing agent should instruct the user to open the printed localhost URL in their browser.
> 
> **Deliverables**:
> - `--ui` flag added to the login command definition
> - Local web server module (`src/lib/login-ui-server.ts`) with embedded HTML form
> - Updated `login.ts` with third credential-input branch
> - Tests in `test/commands/login-ui.test.ts`
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: NO — sequential (each task builds on the previous)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
User wants to add an interactive `--ui` flag to the login command that spawns a simple local web server with a static form. The user enters API key and API secret in the browser form (without credentials passing through the terminal or being exposed to LLMs). The executing agent should instruct the user to open the browser at the spawned URL to enter credentials.

### Interview Summary
**Key Discussions**:
- **Browser opening**: Print URL to stdout only — do NOT auto-open browser. The agent/user reads the URL and opens it manually.
- **Form fields**: All fields (Profile, API Key, API Secret, API URL) — mirrors the existing interactive TTY flow.
- **Port selection**: OS-assigned (port 0), actual port printed to terminal.
- **Test strategy**: Tests after implementation using existing `bun test` infrastructure.

**Research Findings**:
- CLI is TypeScript/Bun using `@bunli/core` for command definitions
- Login command at `src/commands/login.ts` — `runLogin()` handles inline flags vs TTY interactive
- Boolean flag pattern exists: `option(z.boolean().optional(), { ... })` (see `src/commands/trade/limit-order.ts:33`)
- Config saved via `saveConfigProfile()` → atomic TOML write to `~/.whitebit/config.toml` with 0600 permissions
- `Bun.serve()` is mandated by project rules — no express, no external HTTP deps
- Compiled binary via `bun build --compile` — HTML must be embedded as string (not as separate `.html` file) to guarantee compiled binary compatibility

### Metis Review
**Identified Gaps** (addressed):
- **Flag mutual exclusivity**: `--ui` + `--api-key`/`--api-secret` must error — added as guardrail
- **Server bind address**: Must be `127.0.0.1` (not `0.0.0.0`) — added as security guardrail
- **Double form submission**: Server must ignore subsequent POSTs after first success — added to acceptance criteria
- **Ctrl+C cleanup**: SIGINT handler must call `server.stop()` — added to implementation requirements
- **Form field defaults**: Profile defaults to `"default"`, API URL defaults to `"https://whitebit.com"` — added
- **Invalid form data**: Server-side validation required, return error JSON — added
- **CORS/Origin**: Not needed for localhost short-lived server, but noted
- **Compiled binary HTML imports**: HTML must be embedded as string template, not separate file — avoids `bun build --compile` compatibility risk

---

## Work Objectives

### Core Objective
Add a `--ui` flag to `whitebit login` that spawns a localhost-only web server with a credential form, saving credentials via the existing config flow without exposing them to the terminal.

### Concrete Deliverables
- Modified `src/commands/login.ts` — new `ui` option + third branch in `runLogin()`
- New file `src/lib/login-ui-server.ts` — server logic + embedded HTML
- New file `test/commands/login-ui.test.ts` — tests for the web UI login flow

### Definition of Done
- [ ] `whitebit login --ui` prints a localhost URL and serves an HTML credential form
- [ ] Form submission saves credentials to `~/.whitebit/config.toml` via `saveConfigProfile()`
- [ ] Server shuts down after successful submission
- [ ] Existing login flows (inline flags, TTY interactive) work unchanged
- [ ] `bun test` passes — all existing + new tests
- [ ] `bunx tsc --noEmit` exits 0
- [ ] `bunx biome check .` exits 0

### Must Have
- `--ui` boolean flag on the login command
- Embedded HTML form with Profile, API Key, API Secret, API URL fields
- Server binds to `127.0.0.1` only
- OS-assigned port (port 0)
- URL printed to stdout
- Credentials saved via existing `saveConfigProfile()`
- Server auto-stops after form submission
- SIGINT handler for Ctrl+C cleanup
- Error if `--ui` combined with `--api-key` or `--api-secret` flags
- Server-side validation (apiKey and apiSecret required)
- Tests

### Must NOT Have (Guardrails)
- **No browser auto-open** — no `open` package, no `child_process.exec('open')`
- **No new npm dependencies** — `Bun.serve()` and built-in APIs only
- **No WebSocket, HTTPS, sessions, or tokens** — simple HTTP POST flow
- **No React, Tailwind, or CSS framework** — plain HTML + inline CSS + vanilla JS
- **No separate `.html` file** — embed HTML as template literal in TypeScript for compiled binary compatibility
- **No multi-page flow** — single HTML page, single form, inline success/error feedback via JS
- **No credential echoing** — server responses and terminal output must NOT contain plaintext apiKey/apiSecret
- **No modification to existing login paths** — TTY interactive and inline flag flows remain identical
- **No `0.0.0.0` binding** — server MUST use `hostname: "127.0.0.1"`
- **No over-engineered form validation** — basic required-field checks, not elaborate regex
- **No AI-generated placeholder content** — form labels should be minimal and functional

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.
>
> **FORBIDDEN** — acceptance criteria that require:
> - "User manually tests..." / "User visually confirms..."
> - "User interacts with..." / "User opens browser..."
> - ANY step where a human must perform an action
>
> **ALL verification is executed by the agent** using tools (Playwright, interactive_bash, curl, etc.). No exceptions.

### Test Decision
- **Infrastructure exists**: YES (`bun test` configured, extensive test suite in `test/`)
- **Automated tests**: YES (tests-after)
- **Framework**: `bun:test`

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Every task MUST include Agent-Executed QA Scenarios.
> QA scenarios are the PRIMARY verification method alongside automated tests.
> These describe how the executing agent DIRECTLY verifies the deliverable.

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Web server + HTML** | Bash (curl) | Start server, curl endpoints, verify HTML/JSON responses |
| **CLI flag behavior** | Bash (bun src/cli.ts) | Run command with flags, capture stdout/stderr |
| **Config file writes** | Bash (cat config) | Read TOML file after form submission, verify content |
| **Type/lint checks** | Bash (tsc, biome) | Run checks, assert exit code 0 |

---

## Execution Strategy

### Sequential Execution

All tasks are sequential — each builds on the previous.

```
Task 1: Create login-ui-server.ts (web server module)
    ↓
Task 2: Integrate --ui flag into login command
    ↓
Task 3: Write tests
    ↓
Task 4: Final verification (types, lint, all tests)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 3 | None |
| 3 | 1, 2 | 4 | None |
| 4 | 1, 2, 3 | None | None (final) |

---

## TODOs

- [ ] 1. Create the login UI web server module

  **What to do**:
  - Create new file `src/lib/login-ui-server.ts`
  - Implement a function `startLoginUIServer(defaults?: { profile?: string; apiUrl?: string })` that:
    1. Calls `Bun.serve()` with `port: 0`, `hostname: "127.0.0.1"`
    2. Returns a Promise that resolves with `LoginValues` (the submitted credentials) when the form is submitted, or rejects if the server is killed
    3. **GET `/`** → Responds with HTML page containing:
       - A `<form>` with 4 fields: Profile (text, defaults to `"default"`), API Key (text, required), API Secret (password, required), API URL (text, defaults to `"https://whitebit.com"`)
       - Inline CSS for basic styling (centered card, clean inputs)
       - Vanilla JS `fetch()` handler that POSTs JSON to `/submit`, shows success/error inline
       - WhiteBIT branding (just text title, no logos/images)
    4. **POST `/submit`** → Parses JSON body `{ profile, apiKey, apiSecret, apiUrl }`:
       - Validates `apiKey` and `apiSecret` are non-empty strings
       - Returns `{ success: false, error: "..." }` on validation failure
       - On first valid submission: resolves the Promise with credentials, returns `{ success: true }`, then calls `server.stop()` after a brief delay (100ms) to allow the response to flush
       - Ignores subsequent POSTs after first success (guard flag)
    5. **Any other route** → 404
  - Register a SIGINT handler that calls `server.stop()` and rejects the Promise
  - The HTML must be embedded as a template literal string (NOT a separate `.html` file) for compiled binary compatibility
  - Export the function and the `LoginUIResult` type (which matches `LoginValues` from `login.ts`)

  **Must NOT do**:
  - Do NOT import/create separate HTML files
  - Do NOT add any npm dependencies
  - Do NOT use `0.0.0.0` — always `127.0.0.1`
  - Do NOT echo back credentials in server responses (only `{ success: true }`)
  - Do NOT use React, Tailwind, or any framework in the HTML
  - Do NOT over-engineer the HTML — functional and clean is sufficient

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Greenfield module with embedded HTML, server logic, and Promise-based lifecycle — moderate complexity, multiple concerns in one file
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for crafting a clean, professional HTML form with good UX (field defaults, error display, loading state, success feedback)
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for implementation — only needed for QA (Task 3 handles testing)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (first task)
  - **Blocks**: Tasks 2, 3, 4
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References**:
  - `src/commands/login.ts:9-14` — `LoginValues` interface — the shape that the server must produce when form is submitted (`{ profile?, apiKey, apiSecret, apiUrl? }`)
  - `src/commands/login.ts:21-63` — `collectInteractiveLoginValues()` — reference for default values (profile defaults to `"default"`, apiUrl defaults to `"https://whitebit.com"`) and input validation (apiKey/apiSecret must be non-empty)
  - `src/lib/config.ts:42-48` — `SaveConfigProfileInput` interface — the exact shape that `saveConfigProfile()` accepts. The server's resolved credentials must map to this.
  - `src/lib/config.ts:369-401` — `saveConfigProfile()` implementation — this is what gets called after credentials are received. Understand its inputs.

  **API/Type References**:
  - `src/lib/config.ts:59` — `DEFAULT_API_URL = 'https://whitebit.com'` — use this same default in the HTML form
  - `src/lib/config.ts:60` — `DEFAULT_PROFILE = 'default'` — use this same default in the HTML form

  **External References**:
  - Bun.serve() docs: `Bun.serve({ port: 0, hostname: "127.0.0.1" })` — port 0 for OS-assigned, `server.port` for actual port, `server.stop()` for cleanup
  - Project rules at `.cursor/rules/use-bun-instead-of-node-vite-npm-pnpm.mdc` — mandates `Bun.serve()`, forbids express

  **WHY Each Reference Matters**:
  - `LoginValues` interface: The server MUST produce this exact shape — it's what `runLogin()` feeds to `saveConfigProfile()`
  - `collectInteractiveLoginValues()`: Shows the UX contract — same defaults, same validation rules, same fields
  - `SaveConfigProfileInput`: Ensures the server output maps cleanly to config saving
  - `DEFAULT_API_URL`/`DEFAULT_PROFILE`: Form field defaults must match these constants for consistency

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Server starts and serves HTML form on GET /
    Tool: Bash (bun + curl)
    Preconditions: No other process using the same port
    Steps:
      1. Run: bun -e "import { startLoginUIServer } from './src/lib/login-ui-server.ts'; const s = Bun.serve({ port: 0, hostname: '127.0.0.1', fetch: (await import('./src/lib/login-ui-server.ts')).createLoginUIHandler(() => {}) }); console.log(s.port); setTimeout(() => s.stop(), 5000)" &
         — OR test via a simple inline script that imports and starts the server
      2. Capture the printed port number
      3. curl -s http://127.0.0.1:{port}/
      4. Assert: Response contains '<form'
      5. Assert: Response contains 'API Key' (field label)
      6. Assert: Response contains 'API Secret' (field label)
      7. Assert: Response contains 'Profile' (field label)
      8. Assert: Response contains 'API URL' (field label)
      9. Assert: Response Content-Type is text/html
    Expected Result: HTML form served correctly with all 4 fields
    Evidence: curl output captured

  Scenario: POST /submit with valid data returns success JSON
    Tool: Bash (curl)
    Preconditions: Server running on known port
    Steps:
      1. curl -s -X POST http://127.0.0.1:{port}/submit \
           -H 'Content-Type: application/json' \
           -d '{"profile":"test","apiKey":"key123","apiSecret":"secret456","apiUrl":"https://whitebit.com"}'
      2. Assert: HTTP status 200
      3. Assert: Response body is {"success":true} (or contains "success":true)
      4. Assert: Response does NOT contain "key123" or "secret456"
    Expected Result: Success response without credential echo
    Evidence: Response body captured

  Scenario: POST /submit with missing apiKey returns error
    Tool: Bash (curl)
    Preconditions: Server running on known port (fresh, no prior submission)
    Steps:
      1. curl -s -X POST http://127.0.0.1:{port}/submit \
           -H 'Content-Type: application/json' \
           -d '{"profile":"test","apiKey":"","apiSecret":"secret456"}'
      2. Assert: Response contains "success":false
      3. Assert: Response contains an error message about required fields
    Expected Result: Validation error returned
    Evidence: Response body captured

  Scenario: Unknown route returns 404
    Tool: Bash (curl)
    Preconditions: Server running on known port
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:{port}/nonexistent
      2. Assert: HTTP status is 404
    Expected Result: 404 for unknown routes
    Evidence: Status code captured
  ```

  **Commit**: YES
  - Message: `feat(login): add web UI server module for credential input`
  - Files: `src/lib/login-ui-server.ts`
  - Pre-commit: `bunx tsc --noEmit && bunx biome check .`

---

- [ ] 2. Integrate `--ui` flag into the login command

  **What to do**:
  - In `src/commands/login.ts`:
    1. Add `ui` option to `loginCommand.options`: `ui: option(z.boolean().optional(), { description: 'Open a local web UI to enter credentials securely' })`
    2. Import `startLoginUIServer` from `../lib/login-ui-server`
    3. In `runLogin()`, add a third branch BEFORE the existing `hasInlineCredentials` check:
       ```
       if flags.ui is truthy:
         - check if --api-key or --api-secret were also passed → throw Error("--ui cannot be combined with --api-key or --api-secret")
         - call startLoginUIServer({ profile: flags.profile, apiUrl: flags['api-url'] })
         - print the URL to stdout: "Open this URL in your browser to enter credentials: http://127.0.0.1:{port}"
         - await the Promise to get loginValues
         - continue with saveConfigProfile() and formatOutput() as normal
       ```
    4. The `formatOutput` call should include `interactive: 'ui'` (or a new indicator) to distinguish from TTY/inline modes in the output

  **Must NOT do**:
  - Do NOT modify the existing `hasInlineCredentials` or `collectInteractiveLoginValues` paths
  - Do NOT auto-open a browser
  - Do NOT add any npm dependencies
  - Do NOT change the global options parser in `cli.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, well-defined integration — add option + add branch. The heavy lifting is in Task 1.
  - **Skills**: []
    - No special skills needed — straightforward TypeScript modification following existing patterns
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not relevant — this task is pure CLI logic, no UI work

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: Task 1

  **References** (CRITICAL):

  **Pattern References**:
  - `src/commands/login.ts:113-133` — `loginCommand` definition — add `ui` option here following the existing option pattern
  - `src/commands/login.ts:65-111` — `runLogin()` function — add the `--ui` branch here, before `hasInlineCredentials` check (line 71)
  - `src/commands/trade/limit-order.ts:33` — Boolean option pattern: `postOnly: option(z.boolean().optional(), { description: '...' })` — follow this exact pattern for the `ui` option
  - `src/commands/login.ts:99-111` — `formatOutput()` call — the `--ui` path should produce the same output structure

  **API/Type References**:
  - `src/commands/login.ts:9-14` — `LoginValues` interface — the server returns this shape
  - `src/lib/login-ui-server.ts` (from Task 1) — `startLoginUIServer()` function signature and return type

  **WHY Each Reference Matters**:
  - `loginCommand` definition: Exact location to add the `ui` option
  - `runLogin()`: The integration point — must insert the `--ui` branch correctly
  - Boolean option pattern: Ensures consistency with existing codebase conventions
  - `formatOutput()` call: The `--ui` path must produce the same success output format

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: whitebit login --ui starts server and prints URL
    Tool: Bash (bun)
    Preconditions: None
    Steps:
      1. Run: timeout 5 bun src/cli.ts login --ui 2>&1 || true
      2. Capture stdout
      3. Assert: Output contains "http://127.0.0.1:" followed by a port number
      4. Assert: Output contains instruction text about opening browser
    Expected Result: URL printed to stdout with user instruction
    Evidence: stdout captured

  Scenario: --ui + --api-key errors immediately
    Tool: Bash (bun)
    Preconditions: None
    Steps:
      1. Run: bun src/cli.ts login --ui --api-key testkey 2>&1
      2. Assert: Exit code is non-zero
      3. Assert: stderr contains error message about incompatible flags
    Expected Result: Error message, non-zero exit
    Evidence: stderr + exit code captured

  Scenario: --ui + --api-secret errors immediately
    Tool: Bash (bun)
    Preconditions: None
    Steps:
      1. Run: bun src/cli.ts login --ui --api-secret testsecret 2>&1
      2. Assert: Exit code is non-zero
      3. Assert: stderr contains error message about incompatible flags
    Expected Result: Error message, non-zero exit
    Evidence: stderr + exit code captured

  Scenario: Existing inline login still works (regression)
    Tool: Bash (bun)
    Preconditions: Temp HOME directory for config isolation
    Steps:
      1. Run: HOME=/tmp/whitebit-test-$$ bun src/cli.ts login --api-key key123 --api-secret secret456 --format json 2>&1
      2. Assert: Output contains "updated" and "true"
      3. Assert: /tmp/whitebit-test-$$/.whitebit/config.toml exists and contains "key123"
    Expected Result: Inline login unchanged
    Evidence: stdout + config file content captured
  ```

  **Commit**: YES
  - Message: `feat(login): integrate --ui flag for web-based credential input`
  - Files: `src/commands/login.ts`
  - Pre-commit: `bunx tsc --noEmit && bunx biome check .`

---

- [ ] 3. Write tests for the login UI feature

  **What to do**:
  - Create `test/commands/login-ui.test.ts` with tests using `bun:test`
  - Test structure should follow existing patterns (see `test/lib/config.test.ts` for setup/teardown patterns)
  - Tests to write:
    1. **Server serves HTML form**: Start server → GET `/` → assert response contains `<form`, all field labels, correct Content-Type
    2. **Valid form submission saves config**: Start server → POST `/submit` with valid JSON → assert `{ success: true }` response → assert config TOML file contains saved values
    3. **Missing apiKey returns validation error**: POST with empty apiKey → assert error response
    4. **Missing apiSecret returns validation error**: POST with empty apiSecret → assert error response
    5. **Unknown route returns 404**: GET `/unknown` → assert 404 status
    6. **Server stops after successful submission**: POST valid data → wait briefly → GET `/` → assert connection refused / error
    7. **Flag mutual exclusivity**: Call `runLogin({ ui: true, 'api-key': 'test' })` → assert throws error about incompatible flags
  - Use temp directories for config file isolation (same pattern as `test/lib/config.test.ts:53-61`)
  - Clean up temp directories and stop servers in `afterEach`

  **Must NOT do**:
  - Do NOT use Playwright or browser-based testing — test via HTTP requests (curl/fetch)
  - Do NOT test the HTML rendering quality — only test that HTML is served and contains key elements
  - Do NOT mock `Bun.serve()` — use the real server on localhost

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Straightforward test writing following established patterns. No complex logic.
  - **Skills**: []
    - No special skills needed — follows existing test patterns in `test/lib/config.test.ts`
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — tests use HTTP requests, not browser automation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 4
  - **Blocked By**: Tasks 1, 2

  **References** (CRITICAL):

  **Pattern References**:
  - `test/lib/config.test.ts:49-66` — Test setup/teardown pattern: temp directory creation, env var snapshotting, cleanup in `afterEach`
  - `test/lib/config.test.ts:68-78` — Simple assertion pattern: `expect(config.apiKey).toBe('env-key')`
  - `test/lib/config.test.ts:174-188` — Config file verification: creating temp home, checking file existence and permissions

  **API/Type References**:
  - `src/lib/login-ui-server.ts` (from Task 1) — `startLoginUIServer()` function to import and test
  - `src/commands/login.ts` (from Task 2) — `runLogin()` function for integration testing

  **Test References**:
  - `test/lib/config.test.ts` — Full test file demonstrating project test conventions (imports, describe/test structure, async patterns, temp dirs)
  - `test/lib/auth.test.ts` — Another test file for reference on assertion patterns

  **WHY Each Reference Matters**:
  - Config test patterns: Shows how to isolate tests with temp HOME directories and clean up properly
  - `startLoginUIServer()`: The primary function under test
  - `runLogin()`: For integration-level testing of the `--ui` flag path

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: All new tests pass
    Tool: Bash (bun test)
    Preconditions: Tasks 1 and 2 complete
    Steps:
      1. Run: bun test test/commands/login-ui.test.ts
      2. Assert: Exit code 0
      3. Assert: Output shows all tests passing (0 failures)
    Expected Result: All login UI tests pass
    Evidence: Test output captured

  Scenario: Existing tests still pass (regression)
    Tool: Bash (bun test)
    Preconditions: Tasks 1 and 2 complete
    Steps:
      1. Run: bun test
      2. Assert: Exit code 0
      3. Assert: Output shows all tests passing (0 failures)
    Expected Result: No regressions in existing test suite
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `test(login): add tests for web UI credential input`
  - Files: `test/commands/login-ui.test.ts`
  - Pre-commit: `bun test`

---

- [ ] 4. Final verification: types, lint, full test suite

  **What to do**:
  - Run `bunx tsc --noEmit` and verify exit code 0 (no type errors)
  - Run `bunx biome check .` and verify exit code 0 (no lint errors)
  - Run `bun test` and verify all tests pass (existing + new)
  - If any issues found, fix them immediately
  - Verify the complete login flow end-to-end by starting the server, submitting credentials via curl, and checking the config file

  **Must NOT do**:
  - Do NOT skip any verification step
  - Do NOT ignore warnings from tsc or biome

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification-only task — run commands, check exit codes, fix minor issues
  - **Skills**: []
    - No special skills needed — running CLI commands and reading output
  - **Skills Evaluated but Omitted**:
    - All skills: Verification task doesn't need specialized knowledge

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (final)
  - **Blocked By**: Tasks 1, 2, 3

  **References** (CRITICAL):

  **Pattern References**:
  - `package.json:37` — `"test": "bun test"` — the test command
  - `package.json:36` — `"typecheck": "tsc --noEmit"` — the type check command
  - `package.json:35` — `"lint": "biome check ."` — the lint command

  **WHY Each Reference Matters**:
  - These are the project's standard verification commands — use them exactly as defined

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: TypeScript compilation passes
    Tool: Bash
    Preconditions: All source files from Tasks 1-3 present
    Steps:
      1. Run: bunx tsc --noEmit
      2. Assert: Exit code 0
      3. Assert: No error output
    Expected Result: Zero type errors
    Evidence: Exit code + output captured

  Scenario: Biome lint passes
    Tool: Bash
    Preconditions: All source files from Tasks 1-3 present
    Steps:
      1. Run: bunx biome check .
      2. Assert: Exit code 0
    Expected Result: Zero lint errors
    Evidence: Exit code + output captured

  Scenario: Full test suite passes
    Tool: Bash
    Preconditions: All source and test files from Tasks 1-3 present
    Steps:
      1. Run: bun test
      2. Assert: Exit code 0
      3. Assert: Output shows 0 failures
    Expected Result: All tests pass including new login-ui tests
    Evidence: Test output captured

  Scenario: End-to-end login --ui flow
    Tool: Bash (bun + curl)
    Preconditions: Temp HOME for config isolation
    Steps:
      1. Set HOME to temp directory
      2. Run: bun src/cli.ts login --ui & (background)
      3. Capture the printed port from stdout
      4. Wait 1 second for server to be ready
      5. curl -s http://127.0.0.1:{port}/ → Assert contains '<form'
      6. curl -s -X POST http://127.0.0.1:{port}/submit \
           -H 'Content-Type: application/json' \
           -d '{"profile":"e2e-test","apiKey":"e2e-key","apiSecret":"e2e-secret","apiUrl":"https://whitebit.com"}'
      7. Assert: Response contains "success":true
      8. Wait for background process to exit
      9. Read {temp_home}/.whitebit/config.toml
      10. Assert: Contains [e2e-test] section
      11. Assert: Contains api_key = "e2e-key"
      12. Assert: Contains api_secret = "e2e-secret"
    Expected Result: Full flow works: server → form → save → shutdown
    Evidence: Config file content + curl responses captured
  ```

  **Commit**: NO (verification only — no new code unless fixes needed)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(login): add web UI server module for credential input` | `src/lib/login-ui-server.ts` | `bunx tsc --noEmit && bunx biome check .` |
| 2 | `feat(login): integrate --ui flag for web-based credential input` | `src/commands/login.ts` | `bunx tsc --noEmit && bunx biome check .` |
| 3 | `test(login): add tests for web UI credential input` | `test/commands/login-ui.test.ts` | `bun test` |
| 4 | (no commit — verification only, fix commit if needed) | — | `bun test && bunx tsc --noEmit && bunx biome check .` |

---

## Success Criteria

### Verification Commands
```bash
bun test                    # Expected: All tests pass (0 failures)
bunx tsc --noEmit           # Expected: Exit code 0
bunx biome check .          # Expected: Exit code 0
```

### Final Checklist
- [ ] `--ui` flag accepted by `whitebit login`
- [ ] Server starts on `127.0.0.1` with OS-assigned port
- [ ] URL printed to stdout
- [ ] HTML form served with Profile, API Key, API Secret, API URL fields
- [ ] Form submission saves to `~/.whitebit/config.toml`
- [ ] Server stops after successful submission
- [ ] `--ui` + `--api-key` produces error
- [ ] `--ui` + `--api-secret` produces error
- [ ] Ctrl+C stops server cleanly
- [ ] Existing inline flag login works (regression)
- [ ] Existing TTY interactive login works (regression)
- [ ] All "Must NOT Have" items absent
- [ ] All tests pass
- [ ] Types check
- [ ] Lint passes
