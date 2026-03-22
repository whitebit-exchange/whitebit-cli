# Contributing

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- Node.js ≥ 18 (for TypeScript tooling)
- A WhiteBIT account with API credentials (only needed for manual testing against the live API — the automated test suite uses fake credentials and mocked responses)

## Setup

```bash
git clone https://github.com/whitebit-exchange/whitebit-cli
cd cli
bun install
```

Copy `.env.example` to `.env` and fill in your credentials if you want to run authenticated commands locally. The test suite uses the env vars `WHITEBIT_API_KEY` and `WHITEBIT_API_SECRET`.

## Development

```bash
# Run a command without building
bun run dev market list

# Type check
bun run typecheck

# Lint and format
bun run lint
bun run format

# Run all unit tests
bun test

# Run with coverage
bun test --coverage

# Run public endpoint smoke tests (requires internet)
bun run smoke
```

## Project Layout

```
src/
  cli.ts              Entry point — registers command groups, error handler
  commands/           One file per command, one directory per group
  lib/
    api/              Thin wrappers over WhiteBIT REST endpoints
    types/            TypeScript interfaces matching API response shapes
    auth.ts           HMAC-SHA512 request signing
    config.ts         Config loading: CLI flags → env vars → TOML → defaults
    errors.ts         Typed error classes (CredentialsMissingError, etc.)
    formatter.ts      Table and JSON output, error formatting
    http.ts           HttpClient — rate limiting, retry, dry-run, verbose
    rate-limiter.ts   Sliding-window rate limiter (8 categories)
    retry.ts          Exponential backoff helper
    global-config-overrides.ts  Pre-parse global flags before command dispatch
test/
  commands/           Integration tests per command group
  lib/                Unit tests per library module
  smoke.sh            Public endpoint smoke tests
```

## How to Add a New Command

1. Create `src/commands/<group>/<name>.ts`:

```typescript
import { defineCommand } from '@bunli/core';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';
import { AccountApi } from '../../lib/api/account';

export const myNewCommand = defineCommand({
  name: 'my-command',
  description: 'Brief description shown in --help',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();     // omit for public endpoints

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);
    const response = await api.someMethod();

    if (runtimeConfig.dryRun) return;

    formatOutput(response, { format: runtimeConfig.format });
  },
});
```

2. Add the command to its group's `index.ts`:

```typescript
export const myGroup = defineGroup({
  name: 'my-group',
  commands: [existingCommand, myNewCommand],
});
```

3. For public (unauthenticated) endpoints, use `loadPublicConfig()` and `publicGet()` from `http.ts` instead of `loadAuthConfig()`.

4. Add a test in `test/commands/<group>/<name>.test.ts`.

## How to Add a New API Module

1. Create `src/lib/api/<module>.ts` with a class that takes an `HttpClient`.
2. Create `src/lib/types/<module>.ts` for the response interfaces.
3. Follow the pattern in `src/lib/api/trade.ts`: each method returns the unwrapped data or throws on failure.

## Code Style

Enforced by [Biome](https://biomejs.dev):
- Single quotes
- Trailing commas everywhere
- 100 character line width
- No unused variables (error), no explicit `any` (warn)

Run `bun run format` to auto-fix formatting, `bun run lint` to check.

## Testing Guidelines

- Tests use Bun's native test runner (Jest-compatible API)
- Mock `fetch` by assigning `global.fetch = createMockFetch(mockData)` — never use `spyOn` for fetch and never make real API calls in unit tests
- See `test/setup.ts` for shared setup (fake env vars, `resetGlobalConfigOverrides` in `afterEach`)
- Test both success and error paths for each command

## Pull Request Process

1. Ensure `bun run typecheck`, `bun run lint`, and `bun test` all pass
2. Update `CHANGELOG.md` under `[Unreleased]`
3. Keep PRs focused — one feature or fix per PR
