# Draft: CLI Command Restructure — Logical Root-Level Groups

## Current Architecture

### Framework
- `@bunli/core` — TypeScript CLI framework for Bun
- Uses `defineCommand()`, `defineGroup()`, `createCLI()` 
- Groups support nesting (`commands` can contain other groups)
- Binary name: `whitebit`

### Current Command Tree (as registered in cli.ts)
```
whitebit
├── market (group - 12 commands)         # Public market data
│   ├── list, market-status, asset-status, futures-markets
│   ├── collateral-markets, tickers, depth, trades
│   └── kline, fee, funding-history, activity
├── account (group - 27 commands)        # ALL account ops in flat list
│   ├── main-balance, balance, fee
│   ├── deposit-address, fiat-deposit-address, create-address
│   ├── withdraw-crypto, withdraw-crypto-amount, withdraw-fiat
│   ├── deposit-refund, withdraw-history
│   ├── transfer
│   ├── create-code, apply-code, codes-history, my-codes
│   ├── plans, invest, investments-history, close-investment
│   ├── flex-plans, flex-invest, flex-investments, flex-investment-history
│   ├── flex-payment-history, flex-withdraw, flex-close, flex-auto-reinvest
│   ├── mining-hashrate, interest-history, credit-lines
│   └── issue-jwt-token, ws-token
├── trade (group - nested)
│   ├── spot (subgroup - 18 commands)
│   ├── collateral (subgroup - 22 commands)
│   └── convert (subgroup - 3 commands)
├── sub-account (group - 17 commands)    # CRUD + API keys + IPs
├── config (group - 2 commands)          # show, set
├── pool (group - 1 command)             # mining-pool
├── server-time (standalone)
├── status (standalone)
├── completion (standalone)
├── login (standalone)
└── help (standalone)
```

### Key Problems with Current Structure
1. **`account` is a dumping ground** — 27 commands in one flat group (balance, deposits, withdrawals, transfers, codes, staking fixed, staking flex, mining, tokens...)
2. **Current groups follow docs/API structure** not user mental model
3. `server-time` and `status` are orphaned at root (should be in `market` or a status group)
4. `pool` group exists for just 1 command
5. `trade` is well-nested but `account` has no subgroups at all

## User's Request
- "Easy to understand CLI groups"
- "Not rely on how docs structured"
- "Logically structure everything on root level like `{cli} codes`, `{cli} flex`"
- Wants domain-based grouping at root level

## What Needs to Change
- Break `account` mega-group into logical domain groups at root
- Flatten some nesting where it adds friction without clarity
- Group by "what the user is doing" not "which API module it hits"

## Decisions Made

### Orphaned Commands
- `server-time` → absorb into `market` group
- `status` → absorb into `market` group  
- `pool` group → dissolve, `mining-pool` → absorb into `market` group

### Account Decomposition
- `account` group gets broken into root-level groups:
  - `balance` — main-balance, balance, fee, overview
  - `deposit` — deposit-address, fiat-deposit-address, create-address, deposit-refund
  - `withdraw` — withdraw-crypto, withdraw-crypto-amount, withdraw-fiat, withdraw-history
  - `transfer` — transfer, transfer-history
  - `codes` — create-code, apply-code, codes-history, my-codes
  - `credit-lines` — standalone root group/command
  - `ws-token` — standalone root command

### Earn Group (new root)
- Name: `earn`
- Structure: nested subgroups
  - `earn fixed` — plans, invest, investments-history, close-investment
  - `earn flex` — flex-plans, flex-invest, flex-investments, flex-close, flex-withdraw, flex-auto-reinvest, flex-payment-history, flex-investment-history
  - `earn` also includes: interest-history (at earn root level)

### Mining
- `mining-hashrate` → move to `market` group (alongside mining-pool)

### Tokens
- `issue-jwt-token` → DELETE from codebase
- `ws-token` → standalone root command

### Login
- Keep at root level (standalone)

### Trade
- Keep as-is (spot, collateral, convert subgroups — already well-structured)

### Sub-Account
- Keep as-is (cohesive)

### Config
- Keep as-is (show, set)

## Final Proposed Structure
```
whitebit
├── market          # Public data (+ server-time, status, mining-pool, mining-hashrate)
├── balance         # main-balance, balance, fee, overview
├── deposit         # deposit-address, fiat-deposit-address, create-address, deposit-refund
├── withdraw        # withdraw-crypto, withdraw-crypto-amount, withdraw-fiat, withdraw-history
├── transfer        # transfer, transfer-history
├── codes           # create-code, apply-code, codes-history, my-codes
├── credit-lines    # credit-lines (1 cmd → standalone or group?)
├── earn
│   ├── fixed       # plans, invest, investments-history, close-investment
│   ├── flex        # flex-plans, flex-invest, flex-investments, etc.
│   └── interest-history
├── trade
│   ├── spot        (18 cmds)
│   ├── collateral  (22 cmds)
│   └── convert     (3 cmds)
├── sub-account     (17 cmds)
├── config          # show, set
├── login           # root standalone
├── ws-token        # root standalone
├── help            # root standalone
└── completion      # root standalone
```

## Scope Boundaries
- INCLUDE: Command group restructuring in cli.ts
- INCLUDE: Help text rewrite (help.ts)
- INCLUDE: Completion script rewrite (completion.ts)
- INCLUDE: Updating tests that reference group structure (nesting.test.ts)
- INCLUDE: Moving command files to new directory structure where needed
- INCLUDE: Deleting issue-jwt-token command
- INCLUDE: README update for new command structure
- EXCLUDE: Changing any command's actual behavior/handler logic
- EXCLUDE: Changing any API calls or response formatting
- EXCLUDE: Fixing pre-existing LSP type errors
