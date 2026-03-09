# Draft: Second-level Command Depth for Trade

## Requirements (confirmed)
- Introduce a second level of depth for trading commands
- Example: `whitebit trade collateral`, `whitebit trade spot`, `whitebit trade futures`
- User wants me to determine all types to cover

## Technical Findings

### Current Architecture
- **Framework**: `@bunli/core` (Bun CLI framework)
- **Language**: TypeScript
- **Nesting support**: `@bunli/core` DOES support nested groups. `defineGroup` returns a `Group` which has a `commands` array accepting both `Command` and `Group` types. The `registerCommand` function in `cli.ts` recursively registers nested commands.
- **Current top-level groups**: `market`, `account`, `config`, `collateral`, `convert`, `trade`, `sub-account`

### Current Command Structure (Flat)
- `whitebit trade <command>` - 18 spot trading commands
- `whitebit collateral <command>` - 22 collateral/margin commands  
- `whitebit convert <command>` - 3 convert commands

### What Changes
- **Merge** `trade` + `collateral` + possibly `convert` under `whitebit trade <type> <command>`
- New structure: `whitebit trade spot|collateral|futures|convert <command>`

### API Layer
- `src/lib/api/trade.ts` - Spot trade API
- `src/lib/api/collateral.ts` - Collateral trade API
- `src/lib/api/convert.ts` - Convert API

## Open Questions
- Should `collateral` remain as a standalone top-level command too, or ONLY exist under `trade collateral`?
- Should `convert` be part of `trade` or stay standalone?
- What about `futures`? No separate futures commands exist yet - the collateral commands seem to cover margin/futures.
- Should we add a "futures" subgroup or is "collateral" the correct term for WhiteBIT's margin trading?

## Scope Boundaries
- INCLUDE: Reorganizing existing commands under trade subgroups
- EXCLUDE: TBD
