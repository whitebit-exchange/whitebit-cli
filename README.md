# WhiteBIT CLI

[![npm](https://img.shields.io/npm/v/whitebit-cli.svg?style=flat-square)](https://www.npmjs.com/package/whitebit-cli)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square)](LICENSE)

WhiteBIT Exchange CLI — trade, manage accounts, and query market data directly from your terminal.
Built for scripting, CI/CD pipelines, and anyone who prefers the command line over a browser UI.

## Features

| | |
|---|---|
| **110+ commands** | Full WhiteBIT API surface: spot, collateral, earn, sub-accounts, deposits, withdrawals |
| **Multi-profile** | Named profiles in `~/.whitebit/config.toml` — switch between different API keys with `--profile` |
| **`--dry-run` mode** | Preview the exact request payload before it hits the API |
| **JSON output** | `--json` flag on every command — pipe directly into `jq` or any automation tool |
| **Shell completion** | Tab-completion for Bash, Zsh, and Fish |
| **Rate-limit aware** | Built-in token-bucket limiter per API category — no accidental bursts |
| **Cross-platform** | macOS (ARM + x64), Linux, and Windows binaries |

## Installation

### Homebrew (macOS/Linux) — Coming Soon

> Homebrew tap is not yet available. Use NPM in the meantime.

```bash
brew tap whitebit-exchange/tap
brew install whitebit-cli
```

### NPM/Bunx

```bash
# Run directly with bunx (recommended)
bunx whitebit-cli market list

# Or install globally with npm
npm install -g whitebit-cli

# Or run with npx
npx whitebit-cli market list
```

## Quick Start

```bash
# 1. Set credentials (required for account and trading commands)
export WHITEBIT_API_KEY="your-key"
export WHITEBIT_API_SECRET="your-secret"

# 2. Verify setup — no auth needed
whitebit market list

# 3. Check your balance
whitebit balance trade

# 4. Place a limit order
whitebit trade spot limit-order BTC_USDT buy 0.001 50000
```

Public market data commands work without credentials. See [Authentication](#authentication) for all credential options.

> Running from source? Replace `whitebit` with `bun src/cli.ts` in all commands.

## Authentication

Credentials are resolved in priority order (highest first):

| Method | Best For | Persistence | Security |
|--------|----------|-------------|----------|
| **CLI flags** (`--api-key`, `--api-secret`) | Quick testing, scripts | None | Visible in process list ⚠️ |
| **Environment variables** | CI/CD, Docker, one-off scripts | Per-session | Depends on environment |
| **Config file** (`~/.whitebit/config.toml`) | Daily use, multiple profiles | Permanent | 0600 permissions recommended |

### Config file

Create `~/.whitebit/config.toml` with one or more named profiles:

```toml
[default]
api_key = "your-api-key"
api_secret = "your-api-secret"
format = "table"  # or "json"

[work]
api_key = "work-api-key"
api_secret = "work-api-secret"
```

Switch profiles with `--profile`:

```bash
whitebit balance trade --profile work
```

## Commands

| Module | Commands | Auth | Description |
|--------|:--------:|:----:|-------------|
| `market` | 14 | No | Tickers, order book, trades, klines, funding rates, platform status |
| `mining-pool` | 2 | No | Pool statistics and hashrate |
| `balance` | 3 | Yes | Spot, main, and personal fee balances |
| `deposit` | 4 | Yes | Crypto and fiat deposit addresses |
| `withdraw` | 4 | Yes | Crypto and fiat withdrawals + history |
| `transfer` | 1 | Yes | Transfer between main / spot / collateral accounts |
| `codes` | 4 | Yes | Create, apply, and list redemption codes |
| `earn` | 13 | Yes | Fixed and flexible staking, interest history |
| `trade spot` | 18 | Yes | Limit, market, stop, bulk orders; cancel, modify, kill-switch |
| `trade collateral` | 22 | Yes | Margin: leverage, positions, OCO, OTO, conditional orders |
| `trade convert` | 3 | Yes | Estimate and execute asset conversions |
| `sub-account` | 17 | Yes | Sub-account management, API keys, IP whitelists |

### Market Data (Public)

Query real-time market data without authentication.

- `market server-time` — Server timestamp
- `market status` — Platform operational status
- `market list` — All available trading pairs
- `market market-status` — Market status list
- `market asset-status <asset>` — Asset deposit/withdrawal status
- `market futures-markets` — Futures trading pairs
- `market collateral-markets` — Collateral markets
- `market tickers` — All market tickers
- `market depth <pair>` — Order book depth
- `market trades <pair>` — Recent trades history
- `market kline <pair> <interval>` — Candlestick data
- `market fee` — Trading fee schedule
- `market funding-history <pair>` — Futures funding rate history
- `market activity <pair>` — 24h trading activity

### Mining Pool

Mining pool statistics and hashrate.

- `mining-pool overview` — Mining pool statistics
- `mining-pool hashrate` — Mining hashrate

### Balance (Requires Auth)

View account balances and fees.

- `balance main` — Main account balance
- `balance trade [asset]` — Spot/trading balance
- `balance fee` — Personal trading fee rates

### Deposit (Requires Auth)

Manage deposit addresses and requests.

- `deposit address <asset> <network>` — Get deposit address
- `deposit fiat-address <provider> <currency>` — Fiat deposit address
- `deposit create-address <asset> <network>` — Create new deposit address
- `deposit refund <hash>` — Request deposit refund

### Withdraw (Requires Auth)

Manage withdrawals and view history.

- `withdraw crypto <asset> <amount> <address>` — Withdraw crypto
- `withdraw crypto-amount <asset> <address> <amount>` — Withdraw crypto where recipient gets exact amount (fee added on top)
- `withdraw fiat <currency> <amount> <provider>` — Withdraw fiat
- `withdraw history` — Withdrawal history

### Transfer (Requires Auth)

Internal account transfers.

- `transfer internal <asset> <amount> <from> <to>` — Transfer between accounts (valid accounts: `main`, `spot`, `collateral`)

### Codes (Requires Auth)

Manage redemption codes.

- `codes create <asset> <amount>` — Create redemption code
- `codes apply <code>` — Redeem code
- `codes history` — Redemption history (codes you have applied)
- `codes list` — Active codes

### Earn (Requires Auth)

Staking and yield products.

#### Fixed Staking (`earn fixed <command>`)

- `earn fixed plans` — Fixed staking plans
- `earn fixed invest <plan_id> <amount>` — Create fixed staking
- `earn fixed investments-history` — Staking history
- `earn fixed close-investment <id>` — Close staking early

#### Flexible Staking (`earn flex <command>`)

- `earn flex plans` — Flexible staking plans
- `earn flex invest <plan_id> <amount>` — Flexible staking invest
- `earn flex investments` — Active flexible stakings
- `earn flex investment-history` — Flexible staking history
- `earn flex payment-history` — Flexible payment history
- `earn flex withdraw <id> <amount>` — Withdraw from flexible
- `earn flex close <id>` — Close flexible staking
- `earn flex auto-reinvest <id> <enabled>` — Toggle auto-reinvest

#### Interest History

- `earn interest-history` — Interest payment history

### Account Data (Requires Auth)

Account and credit information.

- `credit-lines` — Credit lines
- `ws-token` — WebSocket auth token

### Trading (Requires Auth)

Place, modify, and cancel orders across spot, collateral, and convert markets.

#### Spot Trading (`trade spot <command>`)

- `trade spot limit-order <pair> <side> <amount> <price>` — Create a limit order
- `trade spot market-order <pair> <side> <amount>` — Create a market order
- `trade spot bulk-order <pair> --orders '<json>'` — Create multiple orders in bulk
- `trade spot stop-limit <pair> <side> <amount> <price> <activation_price>` — Create a stop-limit order
- `trade spot stop-market <pair> <side> <amount> <activation_price>` — Create a stop-market order
- `trade spot buy-stock <pair> <amount>` — Create a buy stock market order (buy for fixed money amount)
- `trade spot cancel <pair> <order_id>` — Cancel a specific order
- `trade spot cancel-all` — Cancel all orders (optionally filtered by market)
- `trade spot modify <pair> <order_id>` — Modify an existing order
- `trade spot executed` — List executed orders
- `trade spot unexecuted` — List unexecuted (open) orders
- `trade spot deals <order_id>` — Get executed deals for a specific order
- `trade spot history` — Get trades history
- `trade spot balance` — Get trade balance for all assets
- `trade spot fee <pair>` — Get trading fee for a specific market
- `trade spot all-fees` — Get trading fees for all markets
- `trade spot kill-switch-status` — Get kill switch status
- `trade spot kill-switch-sync <pair> <timeout>` — Sync kill switch timer

#### Collateral Trading (`trade collateral <command>`)

- `trade collateral balance` — Fetch collateral account balance
- `trade collateral summary` — Fetch collateral account summary
- `trade collateral balance-summary` — Fetch collateral account balance summary with detailed asset breakdown
- `trade collateral hedge-mode` — Get collateral account hedge mode status
- `trade collateral set-hedge-mode <enabled>` — Update collateral account hedge mode
- `trade collateral limit-order <pair> <side> <amount> <price>` — Create a collateral limit order
- `trade collateral market-order <pair> <side> <amount>` — Create a collateral market order
- `trade collateral bulk-order <pair> --orders '<json>'` — Create multiple collateral limit orders
- `trade collateral stop-limit <pair> <side> <amount> <price> <activation_price>` — Create a collateral stop-limit order
- `trade collateral trigger-market <pair> <side> <amount> <activation_price>` — Create a collateral trigger market order
- `trade collateral set-leverage <pair> <leverage>` — Set leverage for a collateral market
- `trade collateral close-position <pair>` — Close a collateral position
- `trade collateral open-positions` — Get all open collateral positions
- `trade collateral position-history` — Get collateral positions history
- `trade collateral funding-history` — Get collateral funding history
- `trade collateral conditional-orders` — Get unexecuted conditional orders
- `trade collateral cancel-conditional <pair> <order_id>` — Cancel a conditional order
- `trade collateral oco-orders` — Get unexecuted OCO orders
- `trade collateral create-oco <pair> <side> <amount> <price> <stop_price>` — Create an OCO (One-Cancels-Other) order
- `trade collateral create-oto <pair> <side> <amount> <price> <trigger_price>` — Create an OTO (One-Triggers-Other) order
- `trade collateral cancel-oco <pair> <order_id>` — Cancel an OCO order
- `trade collateral cancel-oto <pair> <order_id>` — Cancel an OTO order

#### Convert (`trade convert <command>`)

- `trade convert estimate <from> <to> <amount>` — Estimate conversion rate and amount
- `trade convert confirm <estimate_id>` — Confirm and execute a conversion
- `trade convert history` — Get conversion history

### Sub-Accounts (Requires Auth)

Manage sub-accounts and transfers.

- `sub-account list` — List all sub-accounts
- `sub-account create <alias>` — Create sub-account
- `sub-account balance <id>` — Sub-account balance
- `sub-account transfer <asset> <amount> [--fromId <id>] [--toId <id>]` — Transfer funds to/from sub-account
- `sub-account transfer-history <sub_account_id>` — Sub-account transfer history
- `sub-account edit <id> <alias>` — Edit sub-account details
- `sub-account delete <id>` — Delete a sub-account
- `sub-account block <id>` — Block a sub-account
- `sub-account unblock <id>` — Unblock a sub-account
- `sub-account api-key-list <sub_account_id>` — List all sub-account API keys
- `sub-account api-key-create <sub_account_id> <label> <permissions>` — Create API key for sub-account
- `sub-account api-key-edit <sub_account_id> <api_key_id>` — Edit sub-account API key
- `sub-account api-key-reset <sub_account_id> <api_key_id>` — Reset sub-account API key
- `sub-account api-key-delete <sub_account_id> <api_key_id>` — Delete sub-account API key
- `sub-account ip-list <sub_account_id> <api_key_id>` — List IP addresses for API key
- `sub-account ip-add <sub_account_id> <api_key_id> <ip>` — Add IP address to API key whitelist
- `sub-account ip-delete <sub_account_id> <api_key_id> <ip>` — Remove IP address from API key whitelist

### Configuration

Manage CLI settings and profiles.

- `config show` — Show resolved configuration values
- `config set --api-key <key> --api-secret <secret>` — Store API credentials

### General Commands

- `help` — Show top-level CLI help and examples
- `login` — Login and save API credentials (interactive or with flags)
- `completion --shell <bash|zsh|fish>` — Generate shell completion script

## Shell Completion

Generate and activate tab-completion for your shell:

```bash
# Bash — add to ~/.bashrc for permanent activation
source <(whitebit completion --shell bash)
# or append to completion file:
whitebit completion --shell bash >> ~/.bash_completion

# Zsh — save to a directory in $fpath
mkdir -p ~/.zfunc
whitebit completion --shell zsh > ~/.zfunc/_whitebit
# Add to ~/.zshrc if not already present:
#   fpath=(~/.zfunc $fpath) && autoload -Uz compinit && compinit

# Fish — drop into completions directory
whitebit completion --shell fish > ~/.config/fish/completions/whitebit.fish
```

## Global Options

Available for all commands:

- `--profile <name>` — Use specific config profile (default: `default`)
- `--api-key <key>` — Override API key
- `--api-secret <secret>` — Override API secret
- `--api-url <url>` — Override API URL
- `--format <table|json>` — Output format
- `--json` — Shortcut for `--format json`
- `--verbose`, `-V` — Verbose output (show raw API responses)
- `--dry-run` — Show what would be sent without executing

## Output Formats

### Table (Default)

Human-readable table output:

```bash
whitebit market list --format table
```

### JSON

Machine-readable JSON output:

```bash
whitebit market list --format json
# or
whitebit market list --json
```

Use with `jq` for filtering:

```bash
whitebit market list --json | jq '.[] | select(.name | contains("BTC"))'
```

## Scripting & Automation

```bash
# Preview a large order before submitting — inspect the request payload
whitebit trade spot limit-order BTC_USDT buy 1.0 50000 --dry-run

# Monitor open orders, refreshing every 5 seconds
watch -n 5 'whitebit trade spot unexecuted --json | jq'

# Use in a CI script — fail the job if the balance check returns an error
whitebit balance trade --json
if [ $? -ne 0 ]; then echo "Balance check failed (exit $?)"; exit 1; fi

# Filter tickers to BTC pairs only
whitebit market tickers --json | jq '[.[] | select(.name | contains("BTC"))]'

# Use a dedicated profile for CI pipelines
whitebit trade spot limit-order BTC_USDT buy 0.001 50000 --profile ci --dry-run
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Authentication / credential error |
| `3` | Network error |
| `4` | Usage / bad arguments |
| `5` | Rate limit (HTTP 429) |

Useful for conditional shell logic:

```bash
whitebit balance trade && echo "OK" || echo "Failed with exit $?"
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for CI/CD pipelines
3. **Set restrictive permissions** on config file: `chmod 600 ~/.whitebit/config.toml`
4. **Use API key restrictions** in WhiteBIT dashboard (IP whitelist, read-only keys)
5. **Avoid `--api-key` flags** in production scripts (visible in process list)

## Reporting Issues

Open an issue at [GitHub Issues](https://github.com/whitebit-exchange/whitebit-cli/issues) and include:

- The exact command you ran
- The full error output from stderr
- Output of `whitebit --version`

For API errors, re-run with `--verbose` to capture the full request and response, and include that output in the issue.

## Development

### Dependencies

The following tools must be installed before working with this project:

- **[Bun](https://bun.sh) ≥ 1.0** — runtime, package manager, test runner, and bundler. Install via:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Node.js ≥ 18** — required only if using `npm`/`npx` instead of Bun directly.
- **Git** — to clone the repository.

### Setup

```bash
# Clone repository
git clone https://github.com/whitebit-exchange/whitebit-cli
cd cli

# Install dependencies
bun install

# Run locally
bun src/cli.ts market list

# Build binaries
bun run build

# Run tests
bun test
```

## License

Apache 2.0 — See [LICENSE](LICENSE) for details.

## Resources

| | |
|---|---|
| [WhiteBIT API Documentation](https://docs.whitebit.com/) | Official API reference |
| [API Platform Overview](https://docs.whitebit.com/platform/overview) | REST, WebSocket, authentication, rate limits |
| [Use with AI](https://docs.whitebit.com/guides/use-with-ai) | Use API docs with Claude, Cursor, VS Code via MCP |
| [GitHub Repository](https://github.com/whitebit-exchange/whitebit-cli) | Source code |
| [Releases](https://github.com/whitebit-exchange/whitebit-cli/releases) | Binaries and changelog |
| [Contributing](CONTRIBUTING.md) | Development setup and contribution guide |
| [Security](SECURITY.md) | Vulnerability reporting and security practices |
| [Report an Issue](https://github.com/whitebit-exchange/whitebit-cli/issues) | Bug reports and feature requests |
| [WhiteBIT Exchange](https://whitebit.com/) | The exchange |
