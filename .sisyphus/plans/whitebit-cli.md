# WhiteBIT CLI — Complete Implementation Plan

## TL;DR

> **Quick Summary**: Build a production-grade CLI for the WhiteBIT cryptocurrency exchange (whitebit.com) that covers all ~100+ REST API v4 endpoints. The CLI is designed for both AI agent tool-calling and shell scripting/automation. Built with Bun + TypeScript + bunli framework, distributed via Homebrew, bunx/npx, and static binaries for 5 platforms.
>
> **Deliverables**:
> - Full CLI binary (`whitebit`) with grouped commands covering all REST API v4 categories
> - API client library with HMAC-SHA512 authentication, rate limiting, and retry logic
> - JSON + Table output formats with consistent response envelope
> - Multi-profile credential management via env vars + TOML config
> - Comprehensive test suite with mock fetch
> - GitHub Actions CI/CD: multi-platform binary builds, npm publish, Homebrew formula
> - Homebrew tap repository setup
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (PoC) → Task 2 (HTTP) → Task 3 (Client) → Tasks 4-9 (Commands in parallel) → Task 10-12 (CI/CD)

---

## Context

### Original Request
Build a WhiteBIT CLI to use with agents, covering all available methods from docs.whitebit.com. Use Bun and TypeScript, cover with tests and API mocks. Use bunli as CLI framework. Distribute via Homebrew, bunx/npx, and static binary on GitHub for different platforms with GitHub pipelines.

### Interview Summary
**Key Discussions**:
- **Command Structure**: Grouped by API category (e.g., `whitebit market tickers`, `whitebit trade order`)
- **Output Formats**: JSON (default, structured envelope) + Table (human-readable, via `--format table`)
- **Credentials**: Environment variables (WHITEBIT_API_KEY/SECRET) + TOML config file (~/.whitebit/config.toml) with named profiles (--profile)
- **WebSocket**: Deferred to v2
- **OAuth**: Skipped (not relevant for CLI/agent usage)
- **Use Case**: Both AI agents and scripting/automation equally
- **Package Name**: `whitebit` (binary and npm package)
- **Testing**: bun test with mock fetch (custom interceptor, no real server)
- **Errors**: Structured JSON with --json flag, human-readable by default
- **Rate Limiting**: Built-in per-endpoint-category limiting
- **Retry**: Exponential backoff for 429/5xx, max 3 retries (WhiteBIT does NOT send Retry-After headers)
- **Multiple Profiles**: Supported via --profile flag and config sections
- **License**: Apache 2.0
- **GitHub Org**: whitebit-exchange/cli, tap at whitebit-exchange/homebrew-tap

**Research Findings**:
- bunli (@bunli/core) uses createCLI/defineCommand/defineGroup/option with Zod schemas
- Bun cross-compilation: `bun build --compile --target=<platform>` supports 5 target platforms
- Homebrew tap: separate repo with Ruby formula pointing to GitHub Release binaries
- WhiteBIT API uses **HMAC-SHA512** (NOT SHA256 as initially assumed) for authentication
- API has two different error formats (public vs private) that need normalization
- Rate limits vary wildly: 10/60s to 12,000/10s depending on endpoint category
- Every authenticated request requires `nonceWindow: true` + timestamp nonce + `request` field auto-injection

**googleworkspace/cli Analysis** (adopted patterns):
- The `gws` CLI (Rust/clap, dynamic command generation from Discovery Documents) was analyzed as reference. 6 patterns adopted:
  1. ~~**Retry-After header**~~ → Investigated but REMOVED: WhiteBIT API does NOT send `Retry-After` headers on 429 responses. Pure exponential backoff used instead (Task 2)
  2. **User-Agent header** → `whitebit-cli/{version}` on all requests (Task 2)
  3. **Atomic file writes** → tmp file + rename for config writes (Task 3)
  4. **`.env.example` template** → documented env var template with sections (Task 1)
  5. **Auth decision table in README** → "Which setup?" table for env/config/flags (Task 12)
  6. **`--dry-run` flag** → preview request without sending, mask secrets (Task 3)
- 4 patterns explicitly skipped: dynamic command generation, AES-256-GCM encrypted credentials, two-phase arg parsing, YAML/CSV output formats

### Metis Review
**Identified Gaps** (addressed):
- **Auth algorithm corrected**: SHA256 → SHA512 (`hex(HMAC_SHA512(payload, key=api_secret))`)
- **Nonce strategy**: Must use `nonceWindow: true` with `Date.now()` timestamp (sequential nonces break concurrent CLI invocations)
- **Request field injection**: Every authenticated POST body must include `request` field matching endpoint path — auto-injected by HTTP layer
- **Non-interactive default**: All commands work without prompts for agent compatibility; interactive mode only with `--interactive` or TTY detection
- **Exit code scheme**: Defined consistent codes (0-5)
- **Config file security**: Set 0600 permissions on creation
- **Proof-of-concept first**: Validate bunli + bun compile compatibility before building 100+ commands
- **Per-category rate limiting**: Not a single global limiter
- **Testing scope**: Test API client thoroughly + 5-10 representative commands, not all 100+
- **API error normalization**: Public endpoints return `{ success, message, params }`, private return `{ code, message, errors }` — normalize into consistent envelope

---

## Work Objectives

### Core Objective
Create a complete CLI tool for the WhiteBIT cryptocurrency exchange that wraps all ~100+ REST API v4 endpoints with proper authentication, rate limiting, retry logic, and dual output format support (JSON + Table), suitable for both AI agent tool-calling and interactive/scripted terminal use.

### Concrete Deliverables
- `whitebit` binary for linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64
- npm package `whitebit` usable via `bunx whitebit` / `npx whitebit`
- Homebrew formula in `whitebit-exchange/homebrew-tap`
- GitHub Actions workflows: CI (lint + test), Release (build + publish + brew update)
- ~100+ CLI commands grouped into 6 categories

### Definition of Done
- [ ] `whitebit --version` prints version on all 5 platform binaries
- [ ] `whitebit --help` lists all command groups
- [ ] All public API endpoints accessible without auth
- [ ] All private API endpoints work with valid API key + secret
- [ ] `bun test` passes with 100% of tests green
- [ ] `bunx whitebit --version` works from npm registry
- [ ] `brew install whitebit-exchange/tap/whitebit` installs working binary
- [ ] GitHub Release contains all 5 platform binaries with SHA256 checksums

### Must Have
- All REST API v4 endpoints covered (Market Data, Spot Trading, Account/Wallet, Collateral Trading, Convert, Sub-Accounts)
- HMAC-SHA512 authentication with nonce window
- Per-endpoint-category rate limiting
- Auto-retry with exponential backoff (429/5xx), max 3 retries
- `User-Agent: whitebit-cli/{version}` header on all requests
- `--dry-run` flag to preview API requests without sending
- JSON output (default) with consistent envelope `{ success, data/error }`
- Table output via `--format table`
- Config file with multiple profiles
- Environment variable credential support
- Comprehensive test suite with mock fetch
- Multi-platform binary builds via GitHub Actions
- npm package distribution
- Homebrew tap

### Must NOT Have (Guardrails)
- **No WebSocket streaming** — deferred to v2
- **No OAuth flow** — not needed for CLI/agent use
- **No interactive prompts by default** — all commands work fully via flags/args
- **No command aliases/shortcuts** in v1 — each command has exactly one name
- **No business logic in commands** — commands are thin wrappers: parse flags → call client → format output
- **No multi-step orchestrations** — no "transfer then withdraw" compound commands
- **No smart output formatting** — no currency formatting, color-coded prices, sparklines in v1
- **No per-command config defaults** — config stores only credentials + default format
- **No circuit breakers or connection pooling** — simple retry only
- **No portfolio views, trading bots, or price alerts**
- **No individual tests for all 100+ commands** — test API client + representative commands

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> Every criterion is verified by running a command or using a tool.

### Test Decision
- **Infrastructure exists**: NO (greenfield project)
- **Automated tests**: YES (TDD for core layers, tests-after for commands)
- **Framework**: bun test (built-in, zero config)

### TDD Strategy
- **HTTP layer** (auth, rate limit, retry): Full TDD — tests first
- **API client methods**: Full TDD — tests first with mock fetch
- **Config loader**: Full TDD — tests first
- **Output formatter**: Full TDD — tests first
- **CLI commands**: Tests-after for 5-10 representative commands (they're thin wrappers)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **CLI binary** | Bash | Run binary with flags, assert stdout/stderr, check exit codes |
| **API client** | bun test | Unit tests with mock fetch |
| **Config** | Bash + bun test | Create temp config, run CLI, verify credential loading |
| **CI/CD** | Bash (gh CLI) | Verify workflow files, dry-run checks |
| **npm package** | Bash | Verify package.json fields, bin entry |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — Sequential within, parallel across):
├── Task 1: Project scaffold + PoC (bunli + bun compile validation)
│
Wave 2 (Core Layers — After Task 1):
├── Task 2: HTTP layer (auth, rate limit, retry) [TDD]
├── Task 3: Config loader + Output formatter [TDD] 
│   (2 and 3 can run in parallel)
│
Wave 3 (API Client + Commands — After Wave 2):
├── Task 4: API Client - Market Data methods + commands [TDD client, tests-after commands]
├── Task 5: API Client - Spot Trading methods + commands
├── Task 6: API Client - Account & Wallet methods + commands
├── Task 7: API Client - Collateral Trading methods + commands
├── Task 8: API Client - Convert methods + commands
├── Task 9: API Client - Sub-Account methods + commands
│   (Tasks 4-9 can ALL run in parallel — each is independent)
│
Wave 4 (Distribution — After Wave 3):
├── Task 10: GitHub Actions CI pipeline (lint + test)
├── Task 11: GitHub Actions Release pipeline (build + publish + brew)
├── Task 12: Homebrew tap + npm package finalization
│   (10-12 can run in parallel)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None (foundational) |
| 2 | 1 | 4-9 | 3 |
| 3 | 1 | 4-9 | 2 |
| 4 | 2, 3 | 10-12 | 5, 6, 7, 8, 9 |
| 5 | 2, 3 | 10-12 | 4, 6, 7, 8, 9 |
| 6 | 2, 3 | 10-12 | 4, 5, 7, 8, 9 |
| 7 | 2, 3 | 10-12 | 4, 5, 6, 8, 9 |
| 8 | 2, 3 | 10-12 | 4, 5, 6, 7, 9 |
| 9 | 2, 3 | 10-12 | 4, 5, 6, 7, 8 |
| 10 | 4-9 | None | 11, 12 |
| 11 | 4-9 | None | 10, 12 |
| 12 | 4-9, 11 | None | 10 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | `delegate_task(category="deep", load_skills=[], ...)` |
| 2 | 2, 3 | `delegate_task(category="ultrabrain", load_skills=[], ...)` — parallel |
| 3 | 4-9 | `delegate_task(category="unspecified-high", load_skills=[], ...)` — all 6 parallel |
| 4 | 10-12 | `delegate_task(category="unspecified-high", load_skills=["git-master"], ...)` — parallel |

---

## TODOs

- [ ] 1. Project Scaffold + Proof of Concept

  **What to do**:
  - Initialize the Bun project: `bun init`, set up `package.json` with name `whitebit`, version `0.1.0`, license `Apache-2.0`
  - Install dependencies: `bun add @bunli/core zod smol-toml` and `bun add -d @types/bun`
  - Create the project directory structure:
    ```
    src/
      cli.ts              # Entry point (#!/usr/bin/env bun)
      commands/
        market/
          tickers.ts      # PoC: public endpoint
        account/
          balance.ts      # PoC: authenticated endpoint
      lib/
        client.ts         # Minimal API client (just enough for PoC)
        http.ts           # HTTP layer with HMAC-SHA512 auth
        config.ts         # Config loader (env vars + TOML)
        formatter.ts      # Output formatter (JSON + table)
        types.ts          # Shared types
    test/
      setup.ts            # Test setup (mock fetch)
    ```
  - Create `src/cli.ts` entry point using bunli's `createCLI()`:
    ```typescript
    #!/usr/bin/env bun
    import { createCLI } from '@bunli/core'
    const cli = await createCLI({ name: 'whitebit', version: '0.1.0', description: 'WhiteBIT Exchange CLI' })
    // Register command groups
    await cli.run()
    ```
  - Create a `market` group with `defineGroup` containing a `tickers` command (GET `/api/v4/public/tickers`, no auth)
  - Create an `account` group with `defineGroup` containing a `balance` command (POST `/api/v4/trade-balance`, auth required)
  - Implement minimal HMAC-SHA512 authentication in `src/lib/http.ts`:
    - Accept `apiKey` and `apiSecret`
    - Build payload: JSON body with `request` field (endpoint path) + `nonce` (Date.now()) + `nonceWindow: true`
    - Base64 encode payload → `X-TXC-PAYLOAD`
    - HMAC-SHA512 sign payload with apiSecret → `X-TXC-SIGNATURE`
    - Set `X-TXC-APIKEY` header
  - Create minimal config loader that reads WHITEBIT_API_KEY and WHITEBIT_API_SECRET from env vars
  - Create minimal JSON output (just `console.log(JSON.stringify(data, null, 2))`)
  - Add `tsconfig.json` with strict mode
  - Add `.gitignore` (node_modules, dist, .env)
  - Create `.env.example` template file with documented sections:
    ```env
    # WhiteBIT CLI Configuration
    # Copy this file to .env and fill in your credentials
    # Alternatively, use `whitebit config set` to store in ~/.whitebit/config.toml

    # === API Credentials ===
    # Get your API key and secret from https://whitebit.com/settings/api
    WHITEBIT_API_KEY=
    WHITEBIT_API_SECRET=

    # === Optional Settings ===
    # Override the API base URL (default: https://whitebit.com)
    # WHITEBIT_API_URL=https://whitebit.com
    ```
  - **CRITICAL VALIDATION**: Compile to binary with `bun build --compile src/cli.ts --outfile dist/whitebit` and verify it runs:
    - `./dist/whitebit --help` shows help text
    - `./dist/whitebit --version` prints version
    - `./dist/whitebit market tickers` returns data (if API is reachable)
  - Verify `bun src/cli.ts --help` also works (development mode)

  **Must NOT do**:
  - Don't implement rate limiting yet (Task 2)
  - Don't implement retry logic yet (Task 2)
  - Don't implement table output yet (Task 3)
  - Don't implement TOML config yet (Task 3)
  - Don't implement more than 2 commands (just tickers + balance for PoC)
  - Don't add tests yet (validate the scaffold works first)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: This is a foundational task that requires validating multiple architectural assumptions (bunli + bun compile, HMAC-SHA512 with Bun's crypto, TOML library compatibility). Deep investigation is needed if things don't work as expected.
  - **Skills**: `[]`
    - No special skills needed — standard TypeScript/Bun development
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — no browser interaction
    - `git-master`: Not needed yet — no git operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None (first task)

  **References**:

  **External References**:
  - bunli documentation: https://bunli.dev/docs — createCLI, defineCommand, defineGroup, option API
  - bunli GitHub: https://github.com/AryaLabsHQ/bunli — example projects in `examples/` directory
  - Bun compile docs: https://bun.sh/docs/bundler/executables — `bun build --compile` usage
  - WhiteBIT API auth: https://docs.whitebit.com/api-reference/authentication — HMAC-SHA512 signature process
  - WhiteBIT tickers endpoint: https://docs.whitebit.com/api-reference/market-data/tickers — GET /api/v4/public/tickers
  - WhiteBIT trade balance: https://docs.whitebit.com/api-reference/spot-trading/trading-balance — POST /api/v4/trade-balance
  - smol-toml (TOML parser): https://www.npmjs.com/package/smol-toml — pure JS TOML parser compatible with Bun

  **Acceptance Criteria**:

  - [ ] `bun src/cli.ts --help` prints CLI help with "market" and "account" groups listed
  - [ ] `bun src/cli.ts --version` prints "0.1.0"
  - [ ] `bun src/cli.ts market tickers` exits 0 and prints JSON with ticker data (or graceful error if no network)
  - [ ] `bun build --compile src/cli.ts --outfile dist/whitebit` succeeds without errors
  - [ ] `./dist/whitebit --help` prints the same help as development mode
  - [ ] `./dist/whitebit --version` prints "0.1.0"
  - [ ] `package.json` has `"name": "whitebit"`, `"bin"` field pointing to `src/cli.ts`
  - [ ] `tsconfig.json` exists with `"strict": true`
  - [ ] Project directory structure matches the planned layout
  - [ ] `.env.example` exists with documented WHITEBIT_API_KEY, WHITEBIT_API_SECRET, and WHITEBIT_API_URL variables

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: CLI help displays command groups
    Tool: Bash
    Preconditions: bun installed, dependencies installed via bun install
    Steps:
      1. Run: bun src/cli.ts --help
      2. Assert: stdout contains "market"
      3. Assert: stdout contains "account"
      4. Assert: exit code is 0
    Expected Result: Help text shows both command groups
    Evidence: Terminal output captured

  Scenario: Compiled binary matches development behavior
    Tool: Bash
    Preconditions: Project built via bun build --compile
    Steps:
      1. Run: bun build --compile src/cli.ts --outfile dist/whitebit
      2. Assert: exit code is 0
      3. Run: ./dist/whitebit --version
      4. Assert: stdout contains "0.1.0"
      5. Run: ./dist/whitebit --help
      6. Assert: stdout contains "market"
      7. Assert: stdout contains "account"
    Expected Result: Compiled binary has identical behavior to bun src/cli.ts
    Evidence: Terminal output captured

  Scenario: HMAC-SHA512 auth headers are correctly formed
    Tool: Bash (bun test)
    Preconditions: None
    Steps:
      1. Create a test file that imports the HTTP layer
      2. Mock fetch to capture request headers
      3. Call an authenticated endpoint
      4. Assert: X-TXC-APIKEY header equals the provided key
      5. Assert: X-TXC-PAYLOAD is valid base64 that decodes to JSON containing "request", "nonce", "nonceWindow"
      6. Assert: X-TXC-SIGNATURE is valid hex string (128 chars for SHA512)
      7. Assert: Decoded payload's "nonceWindow" is true
      8. Assert: Decoded payload's "request" matches the endpoint path
    Expected Result: All auth headers correctly formed per WhiteBIT API spec
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(scaffold): initialize project with bunli CLI framework and PoC commands`
  - Files: `package.json, tsconfig.json, .gitignore, .env.example, src/cli.ts, src/commands/market/tickers.ts, src/commands/account/balance.ts, src/lib/http.ts, src/lib/config.ts, src/lib/formatter.ts, src/lib/types.ts`
  - Pre-commit: `bun build --compile src/cli.ts --outfile dist/whitebit && ./dist/whitebit --version`

---

- [ ] 2. HTTP Layer — Authentication, Rate Limiting, and Retry (TDD)

  **What to do**:
  - Implement the full HTTP layer in `src/lib/http.ts` with TDD:

  **2a. Authentication module** (`src/lib/auth.ts`):
  - RED: Write tests for HMAC-SHA512 signature generation
    - Test: given known apiKey, apiSecret, and payload, produces expected signature
    - Test: payload includes `request` field matching endpoint path
    - Test: payload includes `nonce` as number (Date.now())
    - Test: payload includes `nonceWindow: true`
    - Test: `X-TXC-PAYLOAD` is base64-encoded JSON
    - Test: `X-TXC-SIGNATURE` is hex-encoded HMAC-SHA512
  - GREEN: Implement `createAuthHeaders(apiKey, apiSecret, endpointPath, body?)` function
    - Use `crypto.createHmac('sha512', apiSecret)` from Node.js crypto (available in Bun)
    - Merge user body with `{ request: endpointPath, nonce: Date.now(), nonceWindow: true }`
    - Base64 encode → HMAC-SHA512 sign → return headers object
  - REFACTOR: Extract types, clean up

  **2b. Rate limiter** (`src/lib/rate-limiter.ts`):
  - RED: Write tests for per-category rate limiting
    - Test: allows requests within rate limit
    - Test: delays requests when limit reached
    - Test: resets counter after time window
    - Test: different categories have independent limits
    - Test: returns wait time when throttled
  - GREEN: Implement token bucket or sliding window rate limiter
    - Define rate limit categories matching WhiteBIT docs:
      ```typescript
      const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
        'public': { maxRequests: 2000, windowMs: 10000 },
        'trading': { maxRequests: 10000, windowMs: 10000 },
        'trading-query': { maxRequests: 12000, windowMs: 10000 },
        'account': { maxRequests: 1000, windowMs: 10000 },
        'collateral': { maxRequests: 12000, windowMs: 10000 },
        'convert': { maxRequests: 1000, windowMs: 10000 },
        'sub-account': { maxRequests: 1000, windowMs: 10000 },
      }
      ```
    - Each endpoint is tagged with a category
    - `rateLimiter.acquire(category)` → resolves when safe to send, or waits
  - REFACTOR: Clean up

  **2c. Retry logic** (`src/lib/retry.ts`):
  - RED: Write tests
    - Test: succeeds on first try (no retry)
    - Test: retries on 429 with exponential backoff (1s, 2s, 4s)
    - Test: retries on 5xx errors
    - Test: does NOT retry on 4xx (except 429)
    - Test: gives up after 3 retries
    - Test: passes through the final error after exhausting retries
  - GREEN: Implement `withRetry(fn, maxRetries=3)` wrapper
    - Backoff: 1000ms * 2^attempt
    - Only retry on 429 and 5xx status codes
    - Return last error on exhaustion
  - REFACTOR: Clean up

  **2d. HTTP client** (`src/lib/http.ts`):
  - RED: Write integration tests combining auth + rate limit + retry
    - Test: public request sends no auth headers
    - Test: private request sends correct auth headers
    - Test: rate limiter is applied per category
    - Test: retry is applied on failure
    - Test: `User-Agent` header is set to `whitebit-cli/{version}` on all requests
    - Test: error responses are normalized into consistent format:
      ```typescript
      interface ApiError { code: number; message: string; details?: Record<string, string[]> }
      interface ApiResponse<T> { success: boolean; data?: T; error?: ApiError }
      ```
    - Test: public endpoint error format `{ success: false, message, params }` normalized
    - Test: private endpoint error format `{ code, message, errors }` normalized
  - GREEN: Implement `HttpClient` class
    - `get(path, params?, options?)` — public GET requests
    - `post(path, body?, options?)` — authenticated POST requests
    - `options` includes `{ rateCategory: string; auth?: { apiKey, apiSecret } }`
    - Set `User-Agent: whitebit-cli/{version}` header on ALL requests (public and private)
    - Composes: validateAuth → rateLimiter.acquire → fetch with auth headers + User-Agent → retry on failure → normalize response
  - REFACTOR: Extract shared types, clean up error normalization

  **Must NOT do**:
  - Don't implement any CLI commands in this task
  - Don't implement config loading (Task 3)
  - Don't add output formatting (Task 3)
  - Don't implement API client methods for specific endpoints (Tasks 4-9)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: This is the most logic-heavy task — HMAC-SHA512 cryptography, concurrent rate limiting, retry state machines. Requires careful correctness.
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser interaction

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Tasks 4, 5, 6, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/http.ts` (from Task 1) — Minimal HTTP layer to extend
  - `src/lib/types.ts` (from Task 1) — Shared types

  **External References**:
  - WhiteBIT API auth: https://docs.whitebit.com/api-reference/authentication — Full auth specification, header format, signature algorithm
  - WhiteBIT API rate limits: https://docs.whitebit.com — Rate limit values per endpoint category
  - Bun crypto: https://bun.sh/docs/runtime/nodejs-apis — Node.js crypto API compatibility in Bun
  - bun test: https://bun.sh/docs/cli/test — Test runner documentation, mock support

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/auth.test.ts` → PASS (all auth signature tests green)
  - [ ] `bun test test/lib/rate-limiter.test.ts` → PASS (all rate limiting tests green)
  - [ ] `bun test test/lib/retry.test.ts` → PASS (all retry tests green)
  - [ ] `bun test test/lib/http.test.ts` → PASS (all HTTP client integration tests green)
  - [ ] Auth produces correct HMAC-SHA512 signature for known test vectors
  - [ ] Rate limiter correctly throttles when limit is reached
  - [ ] Retry backs off exponentially: 1s, 2s, 4s
  - [ ] No retry on 4xx errors (except 429)
  - [ ] `User-Agent: whitebit-cli/{version}` header sent on all requests
  - [ ] Error responses normalized into `{ success, data/error }` envelope

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: All HTTP layer tests pass
    Tool: Bash (bun test)
    Preconditions: Task 1 complete, dependencies installed
    Steps:
      1. Run: bun test test/lib/auth.test.ts
      2. Assert: exit code 0, all tests pass
      3. Run: bun test test/lib/rate-limiter.test.ts
      4. Assert: exit code 0, all tests pass
      5. Run: bun test test/lib/retry.test.ts
      6. Assert: exit code 0, all tests pass
      7. Run: bun test test/lib/http.test.ts
      8. Assert: exit code 0, all tests pass
    Expected Result: All HTTP layer tests green
    Evidence: Test output captured

  Scenario: HMAC-SHA512 produces correct signature for known input
    Tool: Bash (bun test)
    Preconditions: Auth module implemented
    Steps:
      1. Test uses known apiSecret "test-secret" and known payload
      2. Computes expected HMAC-SHA512 signature manually
      3. Assert: createAuthHeaders output matches expected signature
      4. Assert: X-TXC-PAYLOAD decodes to JSON with request, nonce, nonceWindow fields
    Expected Result: Deterministic signature generation
    Evidence: Test output captured

  Scenario: Rate limiter enforces per-category limits
    Tool: Bash (bun test)
    Preconditions: Rate limiter implemented
    Steps:
      1. Test acquires 'public' category 2000 times rapidly
      2. Assert: first 2000 resolve immediately
      3. Assert: 2001st request waits or throws
      4. Test acquires 'trading' category — independent of 'public'
      5. Assert: 'trading' category allows requests even when 'public' is exhausted
    Expected Result: Categories have independent rate limits
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(http): add HMAC-SHA512 auth, rate limiting, exponential retry, and User-Agent header`
  - Files: `src/lib/auth.ts, src/lib/rate-limiter.ts, src/lib/retry.ts, src/lib/http.ts, test/lib/auth.test.ts, test/lib/rate-limiter.test.ts, test/lib/retry.test.ts, test/lib/http.test.ts`
  - Pre-commit: `bun test test/lib/`

---

- [ ] 3. Config Loader + Output Formatter (TDD)

  **What to do**:

  **3a. Config loader** (`src/lib/config.ts`) — TDD:
  - RED: Write tests for credential resolution
    - Test: reads WHITEBIT_API_KEY and WHITEBIT_API_SECRET from env vars
    - Test: reads from `~/.whitebit/config.toml` [default] profile when env vars absent
    - Test: reads from named profile with `--profile staging`
    - Test: env vars take precedence over config file
    - Test: throws clear error when no credentials found (for auth-required commands)
    - Test: creates config directory with 0600 permissions
    - Test: warns if config file has loose permissions (not 0600)
    - Test: config file writes are atomic (write to tmp file + rename to prevent corruption on crash/Ctrl-C)
    - Test: handles missing config file gracefully (no crash)
    - Test: parses TOML correctly with api_key and api_secret fields
    - Test: supports optional `default_format` setting per profile
    - Test: supports optional `api_url` override per profile
  - GREEN: Implement `loadConfig(options?: { profile?: string })` function
    - Config file format:
      ```toml
      [default]
      api_key = "your-api-key"
      api_secret = "your-api-secret"
      default_format = "json"

      [staging]
      api_key = "staging-key"
      api_secret = "staging-secret"
      ```
    - Resolution order: CLI flags → env vars → config file → error
    - Use `smol-toml` for TOML parsing (pure JS, Bun-compatible)
    - Use `os.homedir()` for cross-platform `~` expansion
  - Implement `whitebit config set` command for writing config:
    - `whitebit config set --api-key KEY --api-secret SECRET [--profile NAME]`
    - Creates `~/.whitebit/config.toml` if not exists
    - Sets file permissions to 0600
    - **Atomic writes**: Write to temporary file (`config.toml.tmp`) then `rename()` to final path — prevents corruption on crash/Ctrl-C
    - Writes TOML section for the profile
  - Implement `whitebit config show` command:
    - Shows loaded config (masks secrets: `****` + last 4 chars)
    - Shows which source each value came from (env, config, default)

  **3b. Output formatter** (`src/lib/formatter.ts`) — TDD:
  - RED: Write tests
    - Test: JSON format outputs `{ success: true, data: <payload> }` envelope
    - Test: JSON error outputs `{ success: false, error: { code, message, details } }`
    - Test: Table format renders flat objects as ASCII table with headers
    - Test: Table format renders arrays as multi-row table
    - Test: Table format handles empty arrays (shows "No results found")
    - Test: Table format truncates long values (>50 chars)
    - Test: `--format json` flag overrides default
    - Test: `--format table` flag overrides default
    - Test: JSON output goes to stdout, errors go to stderr
  - GREEN: Implement `formatOutput(data, options: { format: 'json' | 'table' })` function
    - JSON mode: `JSON.stringify({ success: true, data }, null, 2)` to stdout
    - Table mode: Simple ASCII table with headers derived from object keys
      - Use unicode box-drawing chars or simple pipes for borders
      - No external dependency — implement basic table renderer
    - Error mode: `JSON.stringify({ success: false, error }, null, 2)` to stderr
    - Human-readable error mode (default): colored error message to stderr
  - REFACTOR: Clean types, ensure consistent output

  **3c. Global CLI options** — wire into bunli:
  - Add global `--format` option (json | table, default: json)
  - Add global `--profile` option (string, default: "default")
  - Add global `--json` flag (shortcut for `--format json`)
  - Add global `--api-key` and `--api-secret` flags (override for single commands)
  - Add global `--api-url` flag (override base URL, default: `https://whitebit.com`)
  - Add global `--verbose` / `-v` flag (show request/response details to stderr)
  - Add global `--no-retry` flag (disable auto-retry)
  - Add global `--dry-run` flag (preview API request without sending):
    - Prints to stderr: HTTP method, full URL, headers (with secrets masked: `****` + last 4 chars), body
    - Does NOT actually send the request — exits with code 0 after printing
    - Useful for debugging and agent introspection
    - Works with all commands (public and private)

  **Must NOT do**:
  - Don't implement any API client methods (Tasks 4-9)
  - Don't add any API-specific commands beyond config set/show
  - Don't implement interactive prompts
  - Don't add YAML or CSV output formats

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Config resolution logic with multiple sources and precedence rules requires careful correctness. Table formatting needs clean algorithm.
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser interaction

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Tasks 4, 5, 6, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/config.ts` (from Task 1) — Minimal config loader to extend
  - `src/lib/formatter.ts` (from Task 1) — Minimal formatter to extend
  - `src/cli.ts` (from Task 1) — Where global options need to be registered

  **External References**:
  - smol-toml: https://www.npmjs.com/package/smol-toml — TOML parse/stringify API
  - bunli global options: https://bunli.dev/docs — How to define options on the root CLI
  - WhiteBIT API base URL: `https://whitebit.com` — base URL for all API calls

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/config.test.ts` → PASS (all config tests green)
  - [ ] `bun test test/lib/formatter.test.ts` → PASS (all formatter tests green)
  - [ ] Config loads from env vars when set
  - [ ] Config loads from TOML file when env vars absent
  - [ ] `--profile staging` loads [staging] section
  - [ ] Config file created with 0600 permissions
  - [ ] JSON output wraps data in `{ success: true, data: ... }` envelope
  - [ ] Table output renders clean ASCII table
  - [ ] Empty data shows "No results found" in table mode
  - [ ] `whitebit config set --api-key X --api-secret Y` creates config file
  - [ ] `whitebit config show` displays config with masked secrets
  - [ ] Config file writes are atomic (tmp + rename pattern)
  - [ ] `--dry-run` flag prints request details to stderr without sending
  - [ ] `--dry-run` masks secrets in output (API key/secret show as `****` + last 4 chars)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Config loads from environment variables
    Tool: Bash
    Preconditions: No config file exists
    Steps:
      1. Run: WHITEBIT_API_KEY=testkey WHITEBIT_API_SECRET=testsecret bun src/cli.ts config show
      2. Assert: stdout contains "testkey" or masked version "****tkey"
      3. Assert: stdout shows source as "environment"
    Expected Result: Env vars correctly loaded
    Evidence: Terminal output captured

  Scenario: Config file with profiles works
    Tool: Bash
    Preconditions: None
    Steps:
      1. Create temp dir, set HOME to it
      2. Run: bun src/cli.ts config set --api-key mainkey --api-secret mainsecret
      3. Assert: File ~/.whitebit/config.toml exists
      4. Run: stat -f %Lp ~/.whitebit/config.toml (macOS) or stat -c %a (Linux)
      5. Assert: permissions are 600
      6. Run: bun src/cli.ts config set --api-key stagingkey --api-secret stagingsecret --profile staging
      7. Run: bun src/cli.ts config show --profile staging
      8. Assert: stdout shows staging credentials (masked)
    Expected Result: Multi-profile config works correctly
    Evidence: Terminal output and file content captured

  Scenario: JSON output follows consistent envelope
    Tool: Bash
    Preconditions: Project running
    Steps:
      1. Run: bun src/cli.ts market tickers --format json 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(typeof d.success, d.success !== undefined)"
      2. Assert: stdout shows "boolean true"
    Expected Result: JSON output always has success field
    Evidence: Terminal output captured

  Scenario: Table output handles empty data
    Tool: Bash (bun test)
    Preconditions: Formatter module implemented
    Steps:
      1. Call formatOutput([], { format: 'table' })
      2. Assert: output contains "No results found"
    Expected Result: Empty data doesn't crash, shows friendly message
    Evidence: Test output captured

  Scenario: Dry-run flag previews request without sending
    Tool: Bash
    Preconditions: Project running, config set with test credentials
    Steps:
      1. Run: WHITEBIT_API_KEY=testkey123 WHITEBIT_API_SECRET=testsecret456 bun src/cli.ts trade balance --dry-run 2>&1
      2. Assert: stderr contains "POST"
      3. Assert: stderr contains "/api/v4/trade-balance"
      4. Assert: stderr contains "****y123" (masked API key)
      5. Assert: stderr does NOT contain "testkey123" (full key never shown)
      6. Assert: exit code is 0
      7. Assert: stdout is empty (no actual API response)
    Expected Result: Request details shown, secrets masked, no actual API call
    Evidence: Terminal output captured

  Scenario: Atomic config write survives interruption
    Tool: Bash (bun test)
    Preconditions: Config module implemented
    Steps:
      1. Test writes config via the atomic write function
      2. Assert: temporary file is created first
      3. Assert: rename() is called to move tmp to final path
      4. Assert: final file has correct content
      5. Assert: final file has 0600 permissions
    Expected Result: Config writes use tmp+rename pattern
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(config): add TOML config with profiles, output formatter, dry-run flag, and atomic writes`
  - Files: `src/lib/config.ts, src/lib/formatter.ts, src/commands/config/set.ts, src/commands/config/show.ts, test/lib/config.test.ts, test/lib/formatter.test.ts`
  - Pre-commit: `bun test test/lib/config.test.ts test/lib/formatter.test.ts`

---

- [ ] 4. API Client + Commands: Market Data (15 endpoints)

  **What to do**:
  - Create `src/lib/api/market.ts` with typed methods for ALL Market Data endpoints
  - Create CLI commands in `src/commands/market/` for each endpoint
  - Write tests for the API client methods (mock fetch)
  - Write tests for 3 representative commands

  **API Client Methods** (TDD — write tests first for each method):
  ```typescript
  // src/lib/api/market.ts
  class MarketApi {
    serverTime(): Promise<ApiResponse<{ time: number }>>
    status(): Promise<ApiResponse<ServerStatus>>
    markets(): Promise<ApiResponse<Record<string, MarketInfo>>>
    marketStatus(): Promise<ApiResponse<MarketStatus[]>>
    assetStatus(): Promise<ApiResponse<Record<string, AssetStatus>>>
    availableFuturesMarkets(): Promise<ApiResponse<string[]>>
    collateralMarkets(): Promise<ApiResponse<string[]>>
    tickers(): Promise<ApiResponse<Record<string, TickerData>>>
    depth(params: { market: string; limit?: number }): Promise<ApiResponse<OrderbookDepth>>
    trades(params: { market: string; type?: 'buy' | 'sell' }): Promise<ApiResponse<TradeRecord[]>>
    kline(params: { market: string; interval: string; start?: number; end?: number; limit?: number }): Promise<ApiResponse<KlineRecord[]>>
    fee(): Promise<ApiResponse<FeeInfo[]>>
    fundingHistory(params: { market: string; limit?: number; offset?: number }): Promise<ApiResponse<FundingRecord[]>>
    miningPoolOverview(): Promise<ApiResponse<MiningPoolData>>
    marketActivity(): Promise<ApiResponse<MarketActivityData>>
  }
  ```

  **CLI Commands** (one per endpoint):
  - `whitebit market server-time` → `serverTime()`
  - `whitebit market status` → `status()`
  - `whitebit market list` → `markets()`
  - `whitebit market market-status` → `marketStatus()`
  - `whitebit market asset-status` → `assetStatus()`
  - `whitebit market futures-markets` → `availableFuturesMarkets()`
  - `whitebit market collateral-markets` → `collateralMarkets()`
  - `whitebit market tickers` → `tickers()` (replace PoC version)
  - `whitebit market depth --market BTC_USDT [--limit 100]` → `depth()`
  - `whitebit market trades --market BTC_USDT [--type buy]` → `trades()`
  - `whitebit market kline --market BTC_USDT --interval 1h [--start X] [--end X] [--limit 100]` → `kline()`
  - `whitebit market fee` → `fee()`
  - `whitebit market funding-history --market BTC_USDT [--limit 50] [--offset 0]` → `fundingHistory()`
  - `whitebit market mining-pool` → `miningPoolOverview()`
  - `whitebit market activity` → `marketActivity()`

  **Each command follows this pattern**:
  ```typescript
  import { defineCommand, option } from '@bunli/core'
  import { z } from 'zod'

  export default defineCommand({
    name: 'tickers',
    description: 'Get ticker data for all markets',
    options: {
      format: option(z.enum(['json', 'table']).default('json'), { description: 'Output format' }),
    },
    handler: async ({ flags }) => {
      const config = loadConfig({ profile: flags.profile })
      const client = createClient(config)
      const result = await client.market.tickers()
      formatOutput(result, { format: flags.format })
    }
  })
  ```

  **Tests**:
  - Unit tests for ALL 15 MarketApi methods (mock fetch, verify URL, params, response parsing)
  - Command tests for 3 representative commands: `tickers` (no params), `depth` (required params), `kline` (multiple optional params)
  - Test that public endpoints do NOT send auth headers
  - Test pagination params (limit, offset) for `fundingHistory`

  **Type definitions**: Create `src/lib/types/market.ts` with full TypeScript types for all response shapes based on WhiteBIT API docs

  **Must NOT do**:
  - Don't add endpoints from other categories
  - Don't add interactive features
  - Don't add custom output formatting beyond JSON/table

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: High volume of endpoints to implement following a consistent pattern. Not architecturally complex but requires thoroughness.
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser work

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 5, 6, 7, 8, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/commands/market/tickers.ts` (from Task 1) — PoC command to follow as pattern
  - `src/lib/http.ts` (from Task 2) — HttpClient to use for requests
  - `src/lib/formatter.ts` (from Task 3) — formatOutput function
  - `src/lib/config.ts` (from Task 3) — loadConfig function

  **External References**:
  - WhiteBIT Market Data API: https://docs.whitebit.com/api-reference/market-data/ — All public endpoint specs
  - GET /api/v4/public/server/time: https://docs.whitebit.com/api-reference/market-data/server-time
  - GET /api/v4/public/tickers: https://docs.whitebit.com/api-reference/market-data/tickers
  - GET /api/v4/public/depth: https://docs.whitebit.com/api-reference/market-data/orderbook
  - GET /api/v4/public/trades: https://docs.whitebit.com/api-reference/market-data/recent-trades
  - GET /api/v4/public/kline: https://docs.whitebit.com/api-reference/market-data/kline

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/api/market.test.ts` → PASS (15 API method tests green)
  - [ ] `bun test test/commands/market/` → PASS (3 command tests green)
  - [ ] `bun src/cli.ts market --help` lists all 15 market subcommands
  - [ ] `bun src/cli.ts market tickers --format json` outputs valid JSON with success envelope
  - [ ] `bun src/cli.ts market depth --market BTC_USDT` outputs orderbook data
  - [ ] All market commands use rate category "public" (2000/10s)
  - [ ] No auth headers sent for any market command

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Market tickers returns valid JSON envelope
    Tool: Bash
    Preconditions: Project running, API reachable or mock fetch active in test
    Steps:
      1. Run: bun test test/lib/api/market.test.ts
      2. Assert: exit code 0
      3. Assert: all 15 test cases pass
    Expected Result: All market API methods correctly call endpoints and parse responses
    Evidence: Test output captured

  Scenario: Market help lists all subcommands
    Tool: Bash
    Preconditions: All market commands registered
    Steps:
      1. Run: bun src/cli.ts market --help
      2. Assert: stdout contains "server-time"
      3. Assert: stdout contains "tickers"
      4. Assert: stdout contains "depth"
      5. Assert: stdout contains "trades"
      6. Assert: stdout contains "kline"
      7. Assert: stdout contains "fee"
      8. Assert: stdout contains "funding-history"
    Expected Result: All 15 market subcommands listed
    Evidence: Terminal output captured

  Scenario: Command with required params validates input
    Tool: Bash
    Preconditions: Project running
    Steps:
      1. Run: bun src/cli.ts market depth (no --market flag)
      2. Assert: exit code is non-zero (4 for validation error)
      3. Assert: stderr contains error about missing "market" option
    Expected Result: Missing required params produce validation error
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `feat(market): add all 15 Market Data API commands`
  - Files: `src/lib/api/market.ts, src/lib/types/market.ts, src/commands/market/*.ts, test/lib/api/market.test.ts, test/commands/market/*.test.ts`
  - Pre-commit: `bun test test/lib/api/market.test.ts test/commands/market/`

---

- [ ] 5. API Client + Commands: Spot Trading (18 endpoints)

  **What to do**:
  - Create `src/lib/api/trade.ts` with typed methods for ALL Spot Trading endpoints
  - Create CLI commands in `src/commands/trade/` for each endpoint
  - Write tests for all API client methods (mock fetch)
  - Write tests for 3 representative commands

  **API Client Methods** (TDD):
  ```typescript
  class TradeApi {
    createLimitOrder(params: { market, side, amount, price }): Promise<ApiResponse>
    createMarketOrder(params: { market, side, amount }): Promise<ApiResponse>
    createBulkOrders(params: { market, orders[] }): Promise<ApiResponse>
    createStopLimitOrder(params: { market, side, amount, price, activation_price }): Promise<ApiResponse>
    createStopMarketOrder(params: { market, side, amount, activation_price }): Promise<ApiResponse>
    createBuyStockMarketOrder(params: { market, amount }): Promise<ApiResponse>
    cancelOrder(params: { market, orderId }): Promise<ApiResponse>
    cancelAllOrders(params: { market? }): Promise<ApiResponse>
    modifyOrder(params: { market, orderId, price?, amount? }): Promise<ApiResponse>
    executedOrders(params: { market?, limit?, offset? }): Promise<ApiResponse>
    unexecutedOrders(params: { market?, limit?, offset? }): Promise<ApiResponse>
    executedDeals(params: { orderId }): Promise<ApiResponse>
    tradesHistory(params: { market?, limit?, offset? }): Promise<ApiResponse>
    tradeBalance(): Promise<ApiResponse>
    marketFee(params: { market }): Promise<ApiResponse>
    allFees(): Promise<ApiResponse>
    killSwitchStatus(): Promise<ApiResponse>
    killSwitchSync(params: { market, timeout }): Promise<ApiResponse>
  }
  ```

  **CLI Commands**:
  - `whitebit trade limit-order --market BTC_USDT --side buy --amount 0.01 --price 50000`
  - `whitebit trade market-order --market BTC_USDT --side buy --amount 0.01`
  - `whitebit trade bulk-order --market BTC_USDT --orders '[...]'`
  - `whitebit trade stop-limit --market BTC_USDT --side buy --amount 0.01 --price 50000 --activation-price 49000`
  - `whitebit trade stop-market --market BTC_USDT --side buy --amount 0.01 --activation-price 49000`
  - `whitebit trade buy-stock --market BTC_USDT --amount 100` (buy by quote amount)
  - `whitebit trade cancel --market BTC_USDT --order-id 12345`
  - `whitebit trade cancel-all [--market BTC_USDT]`
  - `whitebit trade modify --market BTC_USDT --order-id 12345 [--price X] [--amount Y]`
  - `whitebit trade executed [--market BTC_USDT] [--limit 50] [--offset 0]`
  - `whitebit trade unexecuted [--market BTC_USDT] [--limit 50] [--offset 0]`
  - `whitebit trade deals --order-id 12345`
  - `whitebit trade history [--market BTC_USDT] [--limit 50] [--offset 0]`
  - `whitebit trade balance`
  - `whitebit trade fee --market BTC_USDT`
  - `whitebit trade all-fees`
  - `whitebit trade kill-switch-status`
  - `whitebit trade kill-switch-sync --market BTC_USDT --timeout 60`

  **Tests**:
  - Unit tests for ALL 18 TradeApi methods (mock fetch, verify auth headers present, correct endpoint/params)
  - Command tests for 3 representative commands: `limit-order` (write), `unexecuted` (read with pagination), `cancel` (destructive action)
  - Verify all commands send auth headers
  - Verify correct rate categories: trading (write) vs trading-query (read)

  **Must NOT do**:
  - Don't add confirmation prompts for destructive operations (cancel, cancel-all)
  - Don't add order validation beyond type checking (let API handle business rules)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: High volume, consistent pattern, but trading commands need careful param handling
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 6, 7, 8, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/commands/market/tickers.ts` (from Task 4) — Command pattern to follow
  - `src/lib/api/market.ts` (from Task 4) — API client pattern to follow
  - `test/lib/api/market.test.ts` (from Task 4) — Test pattern to follow

  **External References**:
  - WhiteBIT Spot Trading API: https://docs.whitebit.com/api-reference/spot-trading/ — All trading endpoint specs
  - Create limit order: https://docs.whitebit.com/api-reference/spot-trading/create-limit-order
  - Create market order: https://docs.whitebit.com/api-reference/spot-trading/create-market-order
  - Query executed orders: https://docs.whitebit.com/api-reference/spot-trading/query-executed-orders
  - Kill switch: https://docs.whitebit.com/api-reference/spot-trading/kill-switch

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/api/trade.test.ts` → PASS (18 API method tests green)
  - [ ] `bun test test/commands/trade/` → PASS (3 command tests green)
  - [ ] `bun src/cli.ts trade --help` lists all 18 trade subcommands
  - [ ] All trade commands send HMAC-SHA512 auth headers
  - [ ] Write operations use rate category "trading" (10000/10s)
  - [ ] Read operations use rate category "trading-query" (12000/10s)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Trade API methods send correct auth headers
    Tool: Bash (bun test)
    Steps:
      1. Run: bun test test/lib/api/trade.test.ts
      2. Assert: all 18 tests pass
      3. Assert: mock fetch captures X-TXC-APIKEY, X-TXC-PAYLOAD, X-TXC-SIGNATURE headers
      4. Assert: payload contains nonceWindow: true
    Expected Result: All trade methods authenticated correctly
    Evidence: Test output captured

  Scenario: Trade help lists all subcommands
    Tool: Bash
    Steps:
      1. Run: bun src/cli.ts trade --help
      2. Assert: stdout contains "limit-order", "market-order", "cancel", "balance"
    Expected Result: All trade subcommands listed
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `feat(trade): add all 18 Spot Trading API commands`
  - Files: `src/lib/api/trade.ts, src/lib/types/trade.ts, src/commands/trade/*.ts, test/lib/api/trade.test.ts, test/commands/trade/*.test.ts`
  - Pre-commit: `bun test test/lib/api/trade.test.ts test/commands/trade/`

---

- [ ] 6. API Client + Commands: Account & Wallet (35+ endpoints)

  **What to do**:
  - Create `src/lib/api/account.ts` with typed methods for ALL Account & Wallet endpoints
  - Create CLI commands in `src/commands/account/` for each endpoint
  - Write tests for all API client methods (mock fetch)
  - Write tests for 3 representative commands
  - This is the LARGEST command group — follow the established pattern meticulously

  **API Client Methods** (TDD — all methods tested with mock fetch):
  ```typescript
  class AccountApi {
    // Balances
    mainBalance(params?: { ticker? }): Promise<ApiResponse>
    overview(): Promise<ApiResponse>
    balance(): Promise<ApiResponse>
    fee(): Promise<ApiResponse>
    
    // Addresses
    cryptoDepositAddress(params: { ticker, network? }): Promise<ApiResponse>
    fiatDepositAddress(params: { ticker, provider }): Promise<ApiResponse>
    createAddress(params: { ticker, network? }): Promise<ApiResponse>
    
    // Withdrawals
    withdrawCrypto(params: { ticker, amount, address, network?, memo? }): Promise<ApiResponse>
    withdrawCryptoWithAmount(params: { ticker, amount, address, network? }): Promise<ApiResponse>
    withdrawFiat(params: { ticker, amount, provider, ... }): Promise<ApiResponse>
    depositRefund(params: { id }): Promise<ApiResponse>
    withdrawHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    
    // Transfers
    transferHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    transfer(params: { ticker, amount, from, to }): Promise<ApiResponse>
    
    // Codes / Vouchers
    createCode(params: { ticker, amount, passphrase?, description? }): Promise<ApiResponse>
    applyCode(params: { code, passphrase? }): Promise<ApiResponse>
    codesHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    myCodes(params?: { limit?, offset? }): Promise<ApiResponse>
    
    // Investments (Fixed)
    plans(): Promise<ApiResponse>
    invest(params: { planId, amount }): Promise<ApiResponse>
    investmentsHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    closeInvestment(params: { id }): Promise<ApiResponse>
    
    // Flexible Investments
    flexPlans(): Promise<ApiResponse>
    flexInvest(params: { planId, amount }): Promise<ApiResponse>
    flexInvestments(): Promise<ApiResponse>
    flexInvestmentHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    flexPaymentHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    flexWithdraw(params: { id, amount }): Promise<ApiResponse>
    flexClose(params: { id }): Promise<ApiResponse>
    flexAutoReinvest(params: { id, enabled }): Promise<ApiResponse>
    
    // Misc
    rewards(): Promise<ApiResponse>
    miningHashrate(): Promise<ApiResponse>
    interestPaymentsHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    creditLines(): Promise<ApiResponse>
    issueCardToken(params: { ... }): Promise<ApiResponse>
    issueJwtToken(): Promise<ApiResponse>
    websocketProfileToken(): Promise<ApiResponse>
  }
  ```

  **CLI Commands** — one per endpoint, organized with sub-groups where logical:
  - `whitebit account main-balance [--ticker BTC]`
  - `whitebit account overview`
  - `whitebit account balance`
  - `whitebit account fee`
  - `whitebit account deposit-address --ticker BTC [--network ERC20]`
  - `whitebit account fiat-deposit-address --ticker USD --provider PROVIDER`
  - `whitebit account create-address --ticker BTC [--network ERC20]`
  - `whitebit account withdraw-crypto --ticker BTC --amount 0.1 --address ADDR [--network ERC20] [--memo MEMO]`
  - `whitebit account withdraw-crypto-amount --ticker BTC --amount 0.1 --address ADDR [--network ERC20]`
  - `whitebit account withdraw-fiat --ticker USD --amount 100 --provider PROVIDER`
  - `whitebit account deposit-refund --id ID`
  - `whitebit account withdraw-history [--limit 50] [--offset 0]`
  - `whitebit account transfer-history [--limit 50] [--offset 0]`
  - `whitebit account transfer --ticker BTC --amount 0.1 --from main --to trade`
  - `whitebit account create-code --ticker BTC --amount 0.1 [--passphrase PASS] [--description DESC]`
  - `whitebit account apply-code --code CODE [--passphrase PASS]`
  - `whitebit account codes-history [--limit 50] [--offset 0]`
  - `whitebit account my-codes [--limit 50] [--offset 0]`
  - `whitebit account plans`
  - `whitebit account invest --plan-id ID --amount 100`
  - `whitebit account investments-history [--limit 50] [--offset 0]`
  - `whitebit account close-investment --id ID`
  - `whitebit account flex-plans`
  - `whitebit account flex-invest --plan-id ID --amount 100`
  - `whitebit account flex-investments`
  - `whitebit account flex-investment-history [--limit 50] [--offset 0]`
  - `whitebit account flex-payment-history [--limit 50] [--offset 0]`
  - `whitebit account flex-withdraw --id ID --amount 50`
  - `whitebit account flex-close --id ID`
  - `whitebit account flex-auto-reinvest --id ID --enabled true`
  - `whitebit account rewards`
  - `whitebit account mining-hashrate`
  - `whitebit account interest-history [--limit 50] [--offset 0]`
  - `whitebit account credit-lines`
  - `whitebit account issue-card-token`
  - `whitebit account issue-jwt-token`
  - `whitebit account ws-token`

  **Tests**:
  - Unit tests for ALL AccountApi methods
  - Command tests for 3 representative commands: `main-balance` (simple read), `withdraw-crypto` (write with many params), `transfer` (balance transfer)

  **Must NOT do**:
  - Don't add confirmation prompts for withdrawals/transfers
  - Don't validate withdrawal addresses client-side

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Largest batch — 35+ methods. Requires consistency and thoroughness.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 5, 7, 8, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/lib/api/market.ts` (from Task 4) — API client pattern
  - `src/commands/market/tickers.ts` (from Task 4) — Command pattern
  - `test/lib/api/market.test.ts` (from Task 4) — Test pattern

  **External References**:
  - WhiteBIT Account & Wallet API: https://docs.whitebit.com/api-reference/account-wallet/ — All account endpoint specs
  - Main balance: https://docs.whitebit.com/api-reference/account-wallet/main-balance
  - Withdraw crypto: https://docs.whitebit.com/api-reference/account-wallet/create-withdraw-request
  - Transfer between balances: https://docs.whitebit.com/api-reference/account-wallet/transfer-between-balances
  - Voucher codes: https://docs.whitebit.com/api-reference/account-wallet/create-code

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/api/account.test.ts` → PASS (35+ API method tests green)
  - [ ] `bun test test/commands/account/` → PASS (3 command tests green)
  - [ ] `bun src/cli.ts account --help` lists all account subcommands
  - [ ] All account commands send auth headers
  - [ ] All account commands use rate category "account" (1000/10s)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Account API methods all tested
    Tool: Bash (bun test)
    Steps:
      1. Run: bun test test/lib/api/account.test.ts
      2. Assert: exit code 0, all tests pass
      3. Assert: test count >= 35
    Expected Result: All account methods tested with mock fetch
    Evidence: Test output captured

  Scenario: Account help lists all subcommands
    Tool: Bash
    Steps:
      1. Run: bun src/cli.ts account --help
      2. Assert: stdout contains key commands like "main-balance", "withdraw-crypto", "transfer", "flex-invest"
    Expected Result: Complete listing of account commands
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `feat(account): add all 35+ Account & Wallet API commands`
  - Files: `src/lib/api/account.ts, src/lib/types/account.ts, src/commands/account/*.ts, test/lib/api/account.test.ts, test/commands/account/*.test.ts`
  - Pre-commit: `bun test test/lib/api/account.test.ts test/commands/account/`

---

- [ ] 7. API Client + Commands: Collateral Trading (22 endpoints)

  **What to do**:
  - Create `src/lib/api/collateral.ts` with typed methods for ALL Collateral Trading endpoints
  - Create CLI commands in `src/commands/collateral/` for each endpoint
  - Write tests for all API client methods
  - Write tests for 3 representative commands

  **API Client Methods** (TDD):
  ```typescript
  class CollateralApi {
    balance(): Promise<ApiResponse>
    summary(): Promise<ApiResponse>
    balanceSummary(): Promise<ApiResponse>
    getHedgeMode(): Promise<ApiResponse>
    setHedgeMode(params: { enabled }): Promise<ApiResponse>
    createLimitOrder(params: { market, side, amount, price, leverage? }): Promise<ApiResponse>
    createMarketOrder(params: { market, side, amount, leverage? }): Promise<ApiResponse>
    createBulkLimitOrders(params: { market, orders[] }): Promise<ApiResponse>
    createStopLimitOrder(params: { market, side, amount, price, activation_price }): Promise<ApiResponse>
    createTriggerMarketOrder(params: { market, side, amount, activation_price }): Promise<ApiResponse>
    setLeverage(params: { market, leverage }): Promise<ApiResponse>
    closePosition(params: { market, positionId? }): Promise<ApiResponse>
    openPositions(params?: { market? }): Promise<ApiResponse>
    positionHistory(params?: { market?, limit?, offset? }): Promise<ApiResponse>
    fundingHistory(params?: { market?, limit?, offset? }): Promise<ApiResponse>
    unexecutedConditionalOrders(params?: { market? }): Promise<ApiResponse>
    cancelConditionalOrder(params: { market, orderId }): Promise<ApiResponse>
    unexecutedOcoOrders(params?: { market? }): Promise<ApiResponse>
    createOcoOrder(params: { market, side, amount, price, stop_price, ... }): Promise<ApiResponse>
    createOtoOrder(params: { market, ... }): Promise<ApiResponse>
    cancelOcoOrder(params: { market, orderId }): Promise<ApiResponse>
    cancelOtoOrder(params: { market, orderId }): Promise<ApiResponse>
  }
  ```

  **CLI Commands**:
  - `whitebit collateral balance`
  - `whitebit collateral summary`
  - `whitebit collateral balance-summary`
  - `whitebit collateral hedge-mode`
  - `whitebit collateral set-hedge-mode --enabled true`
  - `whitebit collateral limit-order --market BTC_USDT --side buy --amount 0.01 --price 50000 [--leverage 10]`
  - `whitebit collateral market-order --market BTC_USDT --side buy --amount 0.01 [--leverage 10]`
  - `whitebit collateral bulk-order --market BTC_USDT --orders '[...]'`
  - `whitebit collateral stop-limit --market BTC_USDT --side buy --amount 0.01 --price 50000 --activation-price 49000`
  - `whitebit collateral trigger-market --market BTC_USDT --side buy --amount 0.01 --activation-price 49000`
  - `whitebit collateral set-leverage --market BTC_USDT --leverage 10`
  - `whitebit collateral close-position --market BTC_USDT [--position-id ID]`
  - `whitebit collateral open-positions [--market BTC_USDT]`
  - `whitebit collateral position-history [--market BTC_USDT] [--limit 50] [--offset 0]`
  - `whitebit collateral funding-history [--market BTC_USDT] [--limit 50] [--offset 0]`
  - `whitebit collateral conditional-orders [--market BTC_USDT]`
  - `whitebit collateral cancel-conditional --market BTC_USDT --order-id ID`
  - `whitebit collateral oco-orders [--market BTC_USDT]`
  - `whitebit collateral create-oco --market BTC_USDT --side buy --amount 0.01 --price 50000 --stop-price 49000`
  - `whitebit collateral create-oto --market BTC_USDT ...`
  - `whitebit collateral cancel-oco --market BTC_USDT --order-id ID`
  - `whitebit collateral cancel-oto --market BTC_USDT --order-id ID`

  **Tests**: Unit tests for all 22 methods + 3 representative command tests

  **Must NOT do**: Same guardrails as other command tasks

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Consistent pattern, high volume
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 5, 6, 8, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/lib/api/market.ts` (from Task 4) — API client pattern
  - `src/lib/api/trade.ts` (from Task 5) — Trading API pattern (closest analog)

  **External References**:
  - WhiteBIT Collateral Trading API: https://docs.whitebit.com/api-reference/collateral-trading/ — All collateral endpoint specs
  - Collateral account balance: https://docs.whitebit.com/api-reference/collateral-trading/collateral-account-balance
  - Collateral limit order: https://docs.whitebit.com/api-reference/collateral-trading/create-collateral-limit-order
  - OCO orders: https://docs.whitebit.com/api-reference/collateral-trading/create-oco-order

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/api/collateral.test.ts` → PASS (22 API method tests green)
  - [ ] `bun test test/commands/collateral/` → PASS (3 command tests green)
  - [ ] `bun src/cli.ts collateral --help` lists all 22 collateral subcommands
  - [ ] All commands use rate category "collateral" (12000/10s)
  - [ ] All commands send auth headers

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Collateral API methods all tested
    Tool: Bash (bun test)
    Steps:
      1. Run: bun test test/lib/api/collateral.test.ts
      2. Assert: exit code 0, test count >= 22
    Expected Result: All collateral methods tested
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(collateral): add all 22 Collateral Trading API commands`
  - Files: `src/lib/api/collateral.ts, src/lib/types/collateral.ts, src/commands/collateral/*.ts, test/lib/api/collateral.test.ts, test/commands/collateral/*.test.ts`
  - Pre-commit: `bun test test/lib/api/collateral.test.ts test/commands/collateral/`

---

- [ ] 8. API Client + Commands: Convert (3 endpoints)

  **What to do**:
  - Create `src/lib/api/convert.ts` with typed methods for all Convert endpoints
  - Create CLI commands in `src/commands/convert/`
  - Write tests for all 3 methods + 2 command tests

  **API Client Methods** (TDD):
  ```typescript
  class ConvertApi {
    estimate(params: { from, to, amount }): Promise<ApiResponse>
    confirm(params: { estimateId }): Promise<ApiResponse>
    history(params?: { limit?, offset? }): Promise<ApiResponse>
  }
  ```

  **CLI Commands**:
  - `whitebit convert estimate --from BTC --to USDT --amount 0.1`
  - `whitebit convert confirm --estimate-id ID`
  - `whitebit convert history [--limit 50] [--offset 0]`

  **Must NOT do**: Same guardrails

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Only 3 endpoints — smallest batch
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 5, 6, 7, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/lib/api/market.ts` (from Task 4) — API client pattern

  **External References**:
  - WhiteBIT Convert API: https://docs.whitebit.com/api-reference/convert/ — Convert endpoint specs

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/api/convert.test.ts` → PASS (3 API method tests green)
  - [ ] `bun test test/commands/convert/` → PASS (2 command tests green)
  - [ ] `bun src/cli.ts convert --help` lists estimate, confirm, history
  - [ ] All commands use rate category "convert" (1000/10s)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Convert estimate command
    Tool: Bash (bun test)
    Steps:
      1. Run: bun test test/lib/api/convert.test.ts test/commands/convert/
      2. Assert: exit code 0, all tests pass
    Expected Result: All convert methods and commands tested
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(convert): add all 3 Convert API commands`
  - Files: `src/lib/api/convert.ts, src/lib/types/convert.ts, src/commands/convert/*.ts, test/lib/api/convert.test.ts, test/commands/convert/*.test.ts`
  - Pre-commit: `bun test test/lib/api/convert.test.ts test/commands/convert/`

---

- [ ] 9. API Client + Commands: Sub-Accounts (17 endpoints)

  **What to do**:
  - Create `src/lib/api/sub-account.ts` with typed methods for ALL Sub-Account endpoints
  - Create CLI commands in `src/commands/sub-account/`
  - Write tests for all 17 methods + 3 command tests

  **API Client Methods** (TDD):
  ```typescript
  class SubAccountApi {
    list(): Promise<ApiResponse>
    create(params: { alias }): Promise<ApiResponse>
    edit(params: { id, alias }): Promise<ApiResponse>
    delete(params: { id }): Promise<ApiResponse>
    block(params: { id }): Promise<ApiResponse>
    unblock(params: { id }): Promise<ApiResponse>
    balance(params: { id }): Promise<ApiResponse>
    transfer(params: { fromId?, toId?, ticker, amount }): Promise<ApiResponse>
    transferHistory(params?: { limit?, offset? }): Promise<ApiResponse>
    apiKeyList(params: { subAccountId }): Promise<ApiResponse>
    apiKeyCreate(params: { subAccountId, label, permissions }): Promise<ApiResponse>
    apiKeyEdit(params: { subAccountId, apiKeyId, label?, permissions? }): Promise<ApiResponse>
    apiKeyReset(params: { subAccountId, apiKeyId }): Promise<ApiResponse>
    apiKeyDelete(params: { subAccountId, apiKeyId }): Promise<ApiResponse>
    ipAddressList(params: { subAccountId, apiKeyId }): Promise<ApiResponse>
    ipAddressAdd(params: { subAccountId, apiKeyId, ip }): Promise<ApiResponse>
    ipAddressDelete(params: { subAccountId, apiKeyId, ip }): Promise<ApiResponse>
  }
  ```

  **CLI Commands**:
  - `whitebit sub-account list`
  - `whitebit sub-account create --alias NAME`
  - `whitebit sub-account edit --id ID --alias NAME`
  - `whitebit sub-account delete --id ID`
  - `whitebit sub-account block --id ID`
  - `whitebit sub-account unblock --id ID`
  - `whitebit sub-account balance --id ID`
  - `whitebit sub-account transfer --ticker BTC --amount 0.1 [--from-id ID] [--to-id ID]`
  - `whitebit sub-account transfer-history [--limit 50] [--offset 0]`
  - `whitebit sub-account api-key-list --sub-account-id ID`
  - `whitebit sub-account api-key-create --sub-account-id ID --label LABEL --permissions trade,withdraw`
  - `whitebit sub-account api-key-edit --sub-account-id ID --api-key-id ID [--label LABEL] [--permissions PERMS]`
  - `whitebit sub-account api-key-reset --sub-account-id ID --api-key-id ID`
  - `whitebit sub-account api-key-delete --sub-account-id ID --api-key-id ID`
  - `whitebit sub-account ip-list --sub-account-id ID --api-key-id ID`
  - `whitebit sub-account ip-add --sub-account-id ID --api-key-id ID --ip 1.2.3.4`
  - `whitebit sub-account ip-delete --sub-account-id ID --api-key-id ID --ip 1.2.3.4`

  **Must NOT do**: Same guardrails

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 17 endpoints, moderate volume with nested resource patterns (sub-account → API keys → IP addresses)
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 5, 6, 7, 8)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `src/lib/api/market.ts` (from Task 4) — API client pattern

  **External References**:
  - WhiteBIT Sub-Accounts API: https://docs.whitebit.com/api-reference/sub-accounts/ — All sub-account endpoint specs

  **Acceptance Criteria**:

  - [ ] `bun test test/lib/api/sub-account.test.ts` → PASS (17 API method tests green)
  - [ ] `bun test test/commands/sub-account/` → PASS (3 command tests green)
  - [ ] `bun src/cli.ts sub-account --help` lists all 17 sub-account subcommands
  - [ ] All commands use rate category "sub-account" (1000/10s)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Sub-account API methods all tested
    Tool: Bash (bun test)
    Steps:
      1. Run: bun test test/lib/api/sub-account.test.ts test/commands/sub-account/
      2. Assert: exit code 0, all tests pass, test count >= 20
    Expected Result: All sub-account methods and commands tested
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(sub-account): add all 17 Sub-Account API commands`
  - Files: `src/lib/api/sub-account.ts, src/lib/types/sub-account.ts, src/commands/sub-account/*.ts, test/lib/api/sub-account.test.ts, test/commands/sub-account/*.test.ts`
  - Pre-commit: `bun test test/lib/api/sub-account.test.ts test/commands/sub-account/`

---

- [ ] 10. GitHub Actions — CI Pipeline (Lint + Test)

  **What to do**:
  - Create `.github/workflows/ci.yml` for continuous integration
  - Triggers: push to main, pull requests
  - Jobs:
    1. **Lint**: Run TypeScript type checking (`bun run tsc --noEmit`)
    2. **Test**: Run all tests (`bun test`)
    3. **Build Check**: Verify compilation (`bun build --compile src/cli.ts --outfile dist/whitebit`)
    4. **Smoke Test**: Run compiled binary (`./dist/whitebit --version`)
  - Add `biome.json` for linting/formatting (Biome is fast, Bun-friendly)
  - Add lint and format scripts to `package.json`:
    ```json
    {
      "scripts": {
        "lint": "biome check .",
        "format": "biome format --write .",
        "typecheck": "tsc --noEmit",
        "test": "bun test",
        "build": "bun build --compile --minify src/cli.ts --outfile dist/whitebit"
      }
    }
    ```
  - Install biome: `bun add -d @biomejs/biome`

  **Must NOT do**:
  - Don't set up release pipeline (Task 11)
  - Don't configure npm publishing (Task 12)
  - Don't add complex linting rules — use biome defaults

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CI pipeline setup with multiple jobs and workflow triggers
  - **Skills**: `["git-master"]`
    - `git-master`: Needed for workflow file best practices

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 11, 12)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Tasks 4-9

  **References**:

  **External References**:
  - GitHub Actions for Bun: https://github.com/oven-sh/setup-bun — Official Bun setup action
  - Biome: https://biomejs.dev/ — Fast linter/formatter
  - GitHub Actions workflow syntax: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

  **Acceptance Criteria**:

  - [ ] `.github/workflows/ci.yml` exists and is valid YAML
  - [ ] CI runs lint, typecheck, test, build, and smoke test
  - [ ] `biome.json` exists with reasonable defaults
  - [ ] `bun run lint` works locally
  - [ ] `bun run typecheck` works locally
  - [ ] `bun run test` works locally
  - [ ] `bun run build` produces binary

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: CI workflow file is valid
    Tool: Bash
    Steps:
      1. Run: cat .github/workflows/ci.yml | bun -e "const y=require('yaml'); y.parse(await Bun.stdin.text()); console.log('valid')"
      2. Assert: stdout contains "valid"
      3. Run: grep -c "bun test" .github/workflows/ci.yml
      4. Assert: output >= 1 (test step exists)
      5. Run: grep -c "bun build --compile" .github/workflows/ci.yml
      6. Assert: output >= 1 (build step exists)
    Expected Result: Valid CI workflow with all required steps
    Evidence: Terminal output captured

  Scenario: All scripts run locally
    Tool: Bash
    Steps:
      1. Run: bun run typecheck
      2. Assert: exit code 0
      3. Run: bun run test
      4. Assert: exit code 0
      5. Run: bun run build
      6. Assert: dist/whitebit binary exists
    Expected Result: All CI steps pass locally
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `ci: add GitHub Actions CI pipeline with lint, test, and build`
  - Files: `.github/workflows/ci.yml, biome.json, package.json (scripts update)`
  - Pre-commit: `bun run lint && bun run typecheck && bun run test`

---

- [ ] 11. GitHub Actions — Release Pipeline (Multi-platform Build + Publish)

  **What to do**:
  - Create `.github/workflows/release.yml` triggered by git tags (`v*`)
  - **Build job**: Matrix strategy for 5 platforms:
    ```yaml
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: bun-linux-x64
            artifact: whitebit-linux-x64
          - os: ubuntu-latest
            target: bun-linux-arm64
            artifact: whitebit-linux-arm64
          - os: macos-latest
            target: bun-darwin-x64
            artifact: whitebit-darwin-x64
          - os: macos-latest
            target: bun-darwin-arm64
            artifact: whitebit-darwin-arm64
          - os: windows-latest
            target: bun-windows-x64
            artifact: whitebit-windows-x64.exe
    ```
  - Each build step:
    1. Checkout code
    2. Setup Bun
    3. `bun install`
    4. `bun build --compile --minify --target=${{ matrix.target }} src/cli.ts --outfile ${{ matrix.artifact }}`
    5. Upload artifact
  - **Release job** (depends on build):
    1. Download all artifacts
    2. Generate SHA256 checksums file
    3. Create GitHub Release with all binaries + checksums
    4. Use `softprops/action-gh-release` action
  - **NPM Publish job** (depends on build):
    1. `npm publish` with `NPM_TOKEN` secret
  - **Homebrew Update job** (depends on release):
    1. Trigger workflow in `whitebit-exchange/homebrew-tap` to update formula
    2. Pass version + SHA256 checksums
  - Create a `scripts/build-all.sh` for local multi-platform builds:
    ```bash
    #!/bin/bash
    targets=("bun-linux-x64" "bun-linux-arm64" "bun-darwin-x64" "bun-darwin-arm64" "bun-windows-x64")
    for target in "${targets[@]}"; do
      bun build --compile --minify --target=$target src/cli.ts --outfile "dist/whitebit-${target#bun-}"
    done
    ```
  - Add version injection: Use `--define "VERSION='${{ github.ref_name }}'"` to inject version from git tag

  **Must NOT do**:
  - Don't create the Homebrew tap repo itself (Task 12)
  - Don't add signing or notarization (v2)
  - Don't add Docker image builds

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex multi-job GitHub Actions workflow with matrix builds and release automation
  - **Skills**: `["git-master"]`
    - `git-master`: Tag-based release workflow expertise

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10, 12)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 12 (partially — brew update job depends on release)
  - **Blocked By**: Tasks 4-9

  **References**:

  **External References**:
  - Bun cross-compilation: https://bun.sh/docs/bundler/executables — Target platforms and flags
  - GitHub Actions release: https://github.com/softprops/action-gh-release — Release action
  - npm publish in CI: https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow

  **Acceptance Criteria**:

  - [ ] `.github/workflows/release.yml` exists and is valid YAML
  - [ ] Release workflow builds for all 5 platforms in matrix
  - [ ] Release workflow creates GitHub Release with binaries
  - [ ] Release workflow generates SHA256 checksums
  - [ ] Release workflow publishes to npm
  - [ ] `scripts/build-all.sh` exists and is executable
  - [ ] Version injection uses git tag

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Release workflow is valid and complete
    Tool: Bash
    Steps:
      1. Verify .github/workflows/release.yml is valid YAML
      2. Grep for all 5 target platforms in the file
      3. Grep for "softprops/action-gh-release" or equivalent release action
      4. Grep for "npm publish" step
      5. Grep for sha256sum or equivalent checksum generation
    Expected Result: All release pipeline components present
    Evidence: Terminal output captured

  Scenario: Local build script works
    Tool: Bash
    Steps:
      1. Run: chmod +x scripts/build-all.sh
      2. Run: scripts/build-all.sh (on host platform only)
      3. Assert: at least host platform binary exists in dist/
    Expected Result: Build script produces binaries
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `ci: add multi-platform release pipeline with npm publish and brew update`
  - Files: `.github/workflows/release.yml, scripts/build-all.sh`
  - Pre-commit: `cat .github/workflows/release.yml | head -5` (basic validity check)

---

- [ ] 12. Homebrew Tap + NPM Package Finalization

  **What to do**:

  **12a. NPM Package finalization**:
  - Ensure `package.json` has all required fields:
    ```json
    {
      "name": "whitebit",
      "version": "0.1.0",
      "description": "WhiteBIT Exchange CLI — Trade, manage accounts, and query market data from the terminal",
      "license": "Apache-2.0",
      "repository": {
        "type": "git",
        "url": "https://github.com/whitebit-exchange/cli"
      },
      "bin": {
        "whitebit": "src/cli.ts"
      },
      "files": ["src/", "LICENSE", "README.md"],
      "keywords": ["whitebit", "crypto", "exchange", "cli", "trading", "api"],
      "engines": {
        "bun": ">=1.0.0"
      },
      "type": "module"
    }
    ```
  - Create `LICENSE` file (Apache 2.0 full text)
  - Create minimal `README.md` with:
    - Installation instructions (brew, bunx, npx, binary download)
    - Quick start (config setup, first command)
    - **Authentication decision table** — "Which setup should I use?" table helping users choose between env vars, config file, and CLI flags:
      ```markdown
      | Method | Best For | Persistence | Security |
      |--------|----------|-------------|----------|
      | Environment variables | CI/CD, Docker, one-off scripts | Per-session | Depends on environment |
      | Config file (`~/.whitebit/config.toml`) | Daily use, multiple profiles | Permanent | 0600 permissions |
      | CLI flags (`--api-key`, `--api-secret`) | Quick testing, scripts | None | Visible in process list |
      ```
    - Command reference (grouped list)
    - Authentication setup
    - Output format examples

  **12b. Homebrew tap setup**:
  - Create Homebrew formula file: `Formula/whitebit.rb`
    ```ruby
    class Whitebit < Formula
      desc "WhiteBIT Exchange CLI"
      homepage "https://github.com/whitebit-exchange/cli"
      version "0.1.0"
      license "Apache-2.0"
      
      on_macos do
        on_arm do
          url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-darwin-arm64"
          sha256 "PLACEHOLDER"
        end
        on_intel do
          url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-darwin-x64"
          sha256 "PLACEHOLDER"
        end
      end
      
      on_linux do
        on_arm do
          url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-linux-arm64"
          sha256 "PLACEHOLDER"
        end
        on_intel do
          url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-linux-x64"
          sha256 "PLACEHOLDER"
        end
      end
      
      def install
        bin.install stable.url.split("/").last => "whitebit"
      end
      
      test do
        assert_match version.to_s, shell_output("#{bin}/whitebit --version")
      end
    end
    ```
  - Create `.github/workflows/update-formula.yml` in the tap repo that:
    1. Receives version + SHA256 values from the CLI repo's release workflow
    2. Updates the formula file with new version and checksums
    3. Commits and pushes
  - Document the tap setup in `docs/homebrew-tap-setup.md` (in the CLI repo, as a reference for the tap repo)

  **12c. `.npmignore` or `files` field**:
  - Ensure only necessary files are published to npm (src/, LICENSE, README.md, package.json)
  - Exclude: test/, dist/, .github/, scripts/, .sisyphus/, biome.json, tsconfig.json

  **Must NOT do**:
  - Don't actually create the whitebit-exchange/homebrew-tap repo (that's a manual GitHub step)
  - Don't publish to npm yet (just prepare the package)
  - Don't write extensive documentation — minimal README only

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple packaging concerns (npm, Homebrew, documentation)
  - **Skills**: `["git-master"]`
    - `git-master`: Git tag management, release preparation

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10, 11)
  - **Parallel Group**: Wave 4
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 4-9 (need all commands for README), Task 11 (release workflow produces artifacts)

  **References**:

  **External References**:
  - Homebrew formula cookbook: https://docs.brew.sh/Formula-Cookbook — How to write formulas
  - npm package.json docs: https://docs.npmjs.com/cli/v10/configuring-npm/package-json — Required fields
  - Apache 2.0 license: https://www.apache.org/licenses/LICENSE-2.0 — Full text

  **Acceptance Criteria**:

  - [ ] `package.json` has all required npm fields (name, version, description, license, repository, bin, files, keywords)
  - [ ] `LICENSE` file contains Apache 2.0 full text
  - [ ] `README.md` exists with installation, quick start, and command reference sections
  - [ ] `Formula/whitebit.rb` exists with correct template structure (even with PLACEHOLDER sha256)
  - [ ] `.npmignore` or `files` field excludes test files and build artifacts
  - [ ] README includes authentication decision table ("Which setup should I use?")
  - [ ] `npm pack --dry-run` shows only intended files
  - [ ] `bunx .` from project root runs the CLI (local bunx test)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: npm package is correctly configured
    Tool: Bash
    Steps:
      1. Run: bun -e "const p=require('./package.json'); console.log(p.name, p.bin, p.license)"
      2. Assert: name is "whitebit", bin exists, license is "Apache-2.0"
      3. Run: npm pack --dry-run 2>&1
      4. Assert: output contains "src/cli.ts"
      5. Assert: output does NOT contain "test/"
      6. Assert: output does NOT contain ".github/"
    Expected Result: Package publishes only source files
    Evidence: Terminal output captured

  Scenario: Homebrew formula has correct structure
    Tool: Bash
    Steps:
      1. Assert: Formula/whitebit.rb exists
      2. Grep for "on_macos" block
      3. Grep for "on_linux" block
      4. Grep for "on_arm" and "on_intel" sub-blocks
      5. Grep for "def install" and "bin.install"
    Expected Result: Formula handles all platforms
    Evidence: Terminal output captured

  Scenario: README has required sections
    Tool: Bash
    Steps:
      1. Grep README.md for "Installation"
      2. Grep README.md for "Quick Start" or "Getting Started"
      3. Grep README.md for "Commands" or "Usage"
      4. Grep README.md for "brew install"
      5. Grep README.md for "bunx whitebit"
      6. Grep README.md for "Which setup should I use" or "Environment variables"
      7. Grep README.md for "Config file" and "CLI flags"
    Expected Result: All installation methods and auth decision table documented
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `chore: finalize npm package, Homebrew formula, and README`
  - Files: `package.json, LICENSE, README.md, Formula/whitebit.rb, .npmignore`
  - Pre-commit: `bun run typecheck`

---

## Commit Strategy

| After Task | Message | Verification |
|------------|---------|--------------|
| 1 | `feat(scaffold): initialize project with bunli CLI framework and PoC commands` | `./dist/whitebit --version` |
| 2 | `feat(http): add HMAC-SHA512 auth, rate limiting, exponential retry, and User-Agent header` | `bun test test/lib/` |
| 3 | `feat(config): add TOML config with profiles, output formatter, dry-run flag, and atomic writes` | `bun test test/lib/config.test.ts test/lib/formatter.test.ts` |
| 4 | `feat(market): add all 15 Market Data API commands` | `bun test test/lib/api/market.test.ts` |
| 5 | `feat(trade): add all 18 Spot Trading API commands` | `bun test test/lib/api/trade.test.ts` |
| 6 | `feat(account): add all 35+ Account & Wallet API commands` | `bun test test/lib/api/account.test.ts` |
| 7 | `feat(collateral): add all 22 Collateral Trading API commands` | `bun test test/lib/api/collateral.test.ts` |
| 8 | `feat(convert): add all 3 Convert API commands` | `bun test test/lib/api/convert.test.ts` |
| 9 | `feat(sub-account): add all 17 Sub-Account API commands` | `bun test test/lib/api/sub-account.test.ts` |
| 10 | `ci: add GitHub Actions CI pipeline with lint, test, and build` | YAML validity |
| 11 | `ci: add multi-platform release pipeline with npm publish and brew update` | YAML validity |
| 12 | `chore: finalize npm package, Homebrew formula, and README` | `npm pack --dry-run` |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
bun test                    # Expected: all tests green

# CLI works in development
bun src/cli.ts --version    # Expected: 0.1.0
bun src/cli.ts --help       # Expected: shows all command groups

# CLI compiles to binary
bun build --compile src/cli.ts --outfile dist/whitebit
./dist/whitebit --version   # Expected: 0.1.0

# All command groups have help
bun src/cli.ts market --help       # Expected: 15 subcommands
bun src/cli.ts trade --help        # Expected: 18 subcommands
bun src/cli.ts account --help      # Expected: 35+ subcommands
bun src/cli.ts collateral --help   # Expected: 22 subcommands
bun src/cli.ts convert --help      # Expected: 3 subcommands
bun src/cli.ts sub-account --help  # Expected: 17 subcommands
bun src/cli.ts config --help       # Expected: set, show subcommands

# Linting passes
bun run lint                # Expected: no errors
bun run typecheck           # Expected: no errors

# Package looks correct
npm pack --dry-run          # Expected: only src/, LICENSE, README.md
```

### Final Checklist
- [ ] All "Must Have" present (110+ commands, auth, rate limiting, retry, JSON/table output, config, tests, CI/CD, brew, npm)
- [ ] All "Must NOT Have" absent (no WebSocket, no OAuth, no interactive prompts by default, no aliases)
- [ ] All tests pass (`bun test`)
- [ ] Compiled binary works (`./dist/whitebit --version`)
- [ ] CI workflow valid (lint + test + build + smoke)
- [ ] Release workflow valid (5-platform matrix + GitHub Release + npm publish + brew update)
- [ ] README documents all installation methods and command groups
- [ ] Exit codes consistent (0=success, 1=API error, 2=auth, 3=network, 4=validation, 5=rate limit)
