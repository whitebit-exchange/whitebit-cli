# WhiteBIT CLI

WhiteBIT Exchange CLI — Trade, manage accounts, and query market data from the terminal.

## Installation

### Homebrew (macOS/Linux)

```bash
brew tap whitebit-exchange/tap
brew install whitebit
```

### NPM/Bunx

```bash
# Run directly with bunx (recommended)
bunx whitebit market list

# Or install globally with npm
npm install -g whitebit

# Or run with npx
npx whitebit market list
```

### Binary Download

Download pre-compiled binaries from [GitHub Releases](https://github.com/whitebit-exchange/cli/releases):

- **macOS (ARM64):** `whitebit-darwin-arm64`
- **macOS (x64):** `whitebit-darwin-x64`
- **Linux (ARM64):** `whitebit-linux-arm64`
- **Linux (x64):** `whitebit-linux-x64`
- **Windows (x64):** `whitebit-windows-x64.exe`

```bash
# Example: Install on macOS ARM64
curl -L -o /usr/local/bin/whitebit https://github.com/whitebit-exchange/cli/releases/latest/download/whitebit-darwin-arm64
chmod +x /usr/local/bin/whitebit
```

## Quick Start

### 1. Configuration (Optional)

Create a configuration file at `~/.whitebit/config.toml`:

```toml
[default]
api_key = "your-api-key"
api_secret = "your-api-secret"
format = "table"  # or "json"

[testnet]
api_key = "testnet-key"
api_secret = "testnet-secret"
api_url = "https://api.testnet.whitebit.com"
```

### 2. Authentication Methods

| Method | Best For | Persistence | Security |
|--------|----------|-------------|----------|
| **Environment variables** | CI/CD, Docker, one-off scripts | Per-session | Depends on environment |
| **Config file** (`~/.whitebit/config.toml`) | Daily use, multiple profiles | Permanent | 0600 permissions recommended |
| **CLI flags** (`--api-key`, `--api-secret`) | Quick testing, scripts | None | Visible in process list ⚠️ |

**Examples:**

```bash
# Using environment variables
export WHITEBIT_API_KEY="your-key"
export WHITEBIT_API_SECRET="your-secret"
whitebit account balance

# Using config file profile
whitebit account balance --profile testnet

# Using CLI flags (least secure)
whitebit account balance --api-key "your-key" --api-secret "your-secret"
```

### 3. Your First Commands

```bash
# Public market data (no auth required)
whitebit market list
whitebit market ticker BTC_USDT
whitebit market depth BTC_USDT

# Account operations (requires auth)
whitebit account balance
whitebit account overview

# Trading operations (requires auth)
whitebit trade spot unexecuted
whitebit trade spot limit-order --market BTC_USDT --side buy --price 50000 --amount 0.001

# Configuration
whitebit config show
whitebit config set api_key "your-key"
```

## Command Reference

### Market Data (Public)

Query real-time market data without authentication.

- `market server-time` — Server timestamp
- `market status` — Platform operational status
- `market list` — All available trading pairs
- `market status <pair>` — Market pair status
- `market asset-status <asset>` — Asset deposit/withdrawal status
- `market futures-markets` — Futures trading pairs
- `market collateral-markets` — Collateral markets
- `market tickers` — All market tickers
- `market ticker <pair>` — Single pair ticker
- `market depth <pair>` — Order book depth
- `market trades <pair>` — Recent trades history
- `market kline <pair> <interval>` — Candlestick data
- `market fee` — Trading fee schedule
- `market funding-history <pair>` — Futures funding rate history
- `market mining-pool` — Mining pool statistics
- `market activity <pair>` — 24h trading activity

### Account Management (Requires Auth)

Manage balances, deposits, withdrawals, and earning products.

- `account main-balance` — Main account balance
- `account overview` — Account overview with all balances
- `account balance [asset]` — Spot/trading balance
- `account fee` — Personal trading fee rates
- `account deposit-address <asset> <network>` — Get deposit address
- `account fiat-deposit-address <provider> <currency>` — Fiat deposit address
- `account create-address <asset> <network>` — Create new deposit address
- `account withdraw-crypto <asset> <amount> <address>` — Withdraw crypto
- `account withdraw-crypto-amount <asset> <address>` — Estimate withdrawal amount
- `account withdraw-fiat <currency> <amount> <provider>` — Withdraw fiat
- `account deposit-refund <hash>` — Request deposit refund
- `account withdraw-history` — Withdrawal history
- `account transfer-history` — Transfer history
- `account transfer <asset> <amount> <from> <to>` — Internal transfer
- `account create-code <asset> <amount>` — Create redemption code
- `account apply-code <code>` — Redeem code
- `account codes-history` — Code creation history
- `account my-codes` — Active codes
- `account plans` — Fixed staking plans
- `account invest <plan_id> <amount>` — Create fixed staking
- `account investments-history` — Staking history
- `account close-investment <id>` — Close staking early
- `account flex-plans` — Flexible staking plans
- `account flex-invest <asset> <amount>` — Flexible staking invest
- `account flex-investments` — Active flexible stakings
- `account flex-investment-history` — Flexible staking history
- `account flex-payment-history` — Flexible payment history
- `account flex-withdraw <asset> <amount>` — Withdraw from flexible
- `account flex-close <id>` — Close flexible staking
- `account flex-auto-reinvest <id> <enabled>` — Toggle auto-reinvest
- `account rewards` — Rewards history
- `account mining-hashrate` — Mining hashrate
- `account interest-history` — Interest payment history
- `account credit-lines` — Credit lines
- `account issue-jwt-token` — Issue JWT token
- `account ws-token` — WebSocket auth token

### Trading (Requires Auth)

Place, modify, and cancel orders across spot, collateral, and convert markets.

#### Spot Trading (`trade spot <command>`)

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

#### Collateral Trading (`trade collateral <command>`)

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

#### Convert (`trade convert <command>`)

- `trade convert estimate` — Estimate conversion rate and amount
- `trade convert confirm` — Confirm and execute a conversion
- `trade convert history` — Get conversion history

### Sub-Accounts (Requires Auth)

Manage sub-accounts and transfers.

- `sub-account list` — List all sub-accounts
- `sub-account create <email>` — Create sub-account
- `sub-account balance <id>` — Sub-account balance
- `sub-account transfer <from_id> <to_id> <asset> <amount>` — Transfer between sub-accounts
- `sub-account transfer-history` — Sub-account transfer history

### Configuration

Manage CLI settings and profiles.

- `config show [key]` — Show configuration
- `config set <key> <value>` — Set configuration value

## Global Options

Available for all commands:

- `--profile <name>` — Use specific config profile (default: `default`)
- `--api-key <key>` — Override API key
- `--api-secret <secret>` — Override API secret
- `--api-url <url>` — Override API URL
- `--format <table|json>` — Output format
- `--json` — Shortcut for `--format json`
- `--verbose`, `-v` — Verbose output (show raw API responses)
- `--no-retry` — Disable automatic retry on transient errors
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

Use with `jq` for advanced filtering:

```bash
whitebit market list --json | jq '.[] | select(.name | contains("BTC"))'
```

## Examples

### Check BTC price

```bash
whitebit market ticker BTC_USDT
```

### Place a limit buy order

```bash
whitebit trade spot limit-order -m BTC_USDT -s buy -p 50000 -a 0.001
```

### Check account balance in JSON

```bash
whitebit account balance --json
```

### Use testnet profile

```bash
whitebit account balance --profile testnet
```

### Monitor active orders

```bash
watch -n 5 'whitebit trade spot unexecuted --json | jq'
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for CI/CD pipelines
3. **Set restrictive permissions** on config file: `chmod 600 ~/.whitebit/config.toml`
4. **Use API key restrictions** in WhiteBIT dashboard (IP whitelist, read-only keys)
5. **Avoid `--api-key` flags** in production scripts (visible in process list)

## Development

```bash
# Clone repository
git clone https://github.com/whitebit-exchange/cli
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

## Links

- [GitHub Repository](https://github.com/whitebit-exchange/cli)
- [WhiteBIT API Documentation](https://docs.whitebit.com/)
- [WhiteBIT Exchange](https://whitebit.com/)
- [Report Issues](https://github.com/whitebit-exchange/cli/issues)
