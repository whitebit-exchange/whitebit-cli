# Draft: WhiteBIT CLI

## Requirements (confirmed)
- **Runtime**: Bun + TypeScript
- **CLI Framework**: bunli (@bunli/core)
- **API Coverage**: ALL WhiteBIT API v4 endpoints (~100+ REST endpoints, WebSocket streams)
- **Testing**: Cover with tests + API mocks
- **Distribution**: Homebrew, bunx/npx, static binaries via GitHub Releases
- **CI/CD**: GitHub Actions for multi-platform builds

## API Scope (from docs.whitebit.com)

### Categories & Endpoint Counts
1. **Market Data (Public)** - ~15 endpoints (GET, no auth)
2. **Spot Trading (Auth)** - ~18 endpoints (POST/GET, HMAC auth)
3. **Account & Wallet (Auth)** - ~35+ endpoints (POST/GET, HMAC auth)
4. **Collateral Trading (Auth)** - ~22 endpoints (POST/GET, HMAC auth)
5. **Convert (Auth)** - 3 endpoints
6. **Sub-Accounts (Auth)** - ~17 endpoints
7. **OAuth** - 3 endpoints
8. **OAuth Usage** - 6 endpoints
9. **WebSocket Streams** - ~15 streams (public + auth)

### Authentication
- Public endpoints: no auth
- Private endpoints: HMAC SHA256 signature
  - `X-TXC-APIKEY` header
  - `X-TXC-PAYLOAD` header (base64 encoded body)
  - `X-TXC-SIGNATURE` header (HMAC SHA256)

## Technical Decisions
- **CLI Framework**: bunli - confirmed by user
- **Schema Validation**: Zod (bunli uses Standard Schema v1, Zod is default)
- **Build Targets**: linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64

## Research Findings
- **bunli**: Type-safe CLI framework for Bun, uses defineCommand/option/defineGroup, Zod schemas, built-in shell/prompts/spinners/colors
- **Bun compile**: `bun build --compile --target=<platform>` for cross-compilation
- **Homebrew**: Create a tap repo (homebrew-whitebit-cli), Ruby formula pointing to GitHub Releases
- **bunx/npx**: package.json `bin` field with shebang `#!/usr/bin/env bun`
- **GitHub Actions**: Matrix strategy for parallel builds across platforms

## Interview Decisions (Round 2)
- **GitHub Repo**: whitebit-exchange/cli
- **Homebrew Tap**: whitebit-exchange/homebrew-tap
- **License**: Apache 2.0
- **OAuth**: Skip (not relevant for CLI/agent usage)
- **Rate Limiting**: Built-in, based on documented limits
- **Retry Logic**: Auto-retry with exponential backoff for 429/5xx errors

## Interview Decisions (Round 1)
- **Command Structure**: Grouped by category (e.g. `whitebit market tickers`, `whitebit trade order`)
- **Output Formats**: JSON (default for agents) + Table (human-readable, via --format flag)
- **Credentials**: Env vars (WHITEBIT_API_KEY, WHITEBIT_API_SECRET) + Config file (~/.whitebit/config.toml)
- **Config Format**: TOML
- **Multiple Profiles**: Yes, support named profiles (--profile flag)
- **WebSocket**: Deferred to v2
- **Primary Use Case**: Both AI agents and scripting/automation equally
- **Package/Binary Name**: `whitebit`
- **API Mocking**: Mock fetch (custom/msw-style, no server needed)
- **Error Output**: Both — structured JSON errors with --json flag, human-readable by default

## Scope Boundaries
- INCLUDE: All REST API v4 endpoints (~100+), grouped CLI commands, JSON+Table output, config management with profiles, tests with API mocks, GitHub Actions CI/CD, multi-platform binaries, Homebrew tap, npm/bunx distribution
- EXCLUDE: WebSocket streams (v2), OAuth flow implementation (complex browser redirects), mining pool operations (niche)
