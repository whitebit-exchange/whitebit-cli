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
whitebit balance trade

# Using config file profile
whitebit balance trade --profile testnet

# Using CLI flags (least secure)
whitebit balance trade --api-key "your-key" --api-secret "your-secret"
```

### 3. Your First Commands

```bash
# Public market data (no auth required)
whitebit market list
whitebit market tickers
whitebit market depth BTC_USDT

# Account operations (requires auth)
whitebit balance trade
whitebit balance fee

# Trading operations (requires auth)
whitebit trade spot unexecuted
whitebit trade spot limit-order BTC_USDT buy 0.001 50000

# Configuration
whitebit config show
whitebit config set --api-key "your-key" --api-secret "your-secret"
```

## Command Reference

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
- `withdraw crypto-amount <asset> <address>` — Estimate withdrawal amount
- `withdraw fiat <currency> <amount> <provider>` — Withdraw fiat
- `withdraw history` — Withdrawal history

### Transfer (Requires Auth)

Internal account transfers.

- `transfer internal <asset> <amount> <from> <to>` — Transfer between accounts (valid accounts: `main`, `spot`, `collateral`)

### Codes (Requires Auth)

Manage redemption codes.

- `codes create <asset> <amount>` — Create redemption code
- `codes apply <code>` — Redeem code
- `codes history` — Code creation history
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
- `sub-account transfer-history` — Sub-account transfer history
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

### Check market tickers

```bash
whitebit market tickers
```

### Place a limit buy order

```bash
whitebit trade spot limit-order BTC_USDT buy 0.001 50000
```

### Check account balance in JSON

```bash
whitebit balance trade --json
```

### Use testnet profile

```bash
whitebit balance trade --profile testnet
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
