# WhiteBIT CLI Learnings

## Conventions

## Patterns Discovered

- Bunli supports nested command groups via `defineGroup`, and top-level groups are shown clearly in `--help` output.
- WhiteBIT auth flow for private requests requires a payload with `request`, `nonce`, and `nonceWindow`, plus `X-TXC-PAYLOAD` (base64 JSON) and `X-TXC-SIGNATURE` (HMAC-SHA512 over the base64 payload).
- Compiled Bun binaries preserve bunli CLI behavior for help/version when built via `bun build --compile src/cli.ts --outfile dist/whitebit`.
- Config persistence is safest with a tmp-file write (`config.toml.tmp`) plus `rename()` and an explicit final `chmod 0600`.
- A centralized `loadConfig()` that returns both resolved values and per-field sources (`cli`, `env`, `config`, `default`) makes `config show` and precedence debugging straightforward.
- For cross-command runtime flags (`--profile`, `--format`, `--dry-run`, credentials), pre-parsing argv once in `src/cli.ts` and storing overrides in config state keeps command handlers simple.
- Keep auth payload generation single-sourced for private POSTs: sign the exact JSON body that is sent, or nonce drift can invalidate signatures.
- A centralized `HttpClient` with normalized `{ success, data, error }` responses makes public/private WhiteBIT error formats consistent for higher-level commands.
- Retry behavior should only target transport saturation/transient server states (`429`, `5xx`) while category-based rate limiting still runs before every attempt.
- TDD approach for API clients: write comprehensive tests first (covering success, params, errors), then implement the API class. This caught several edge cases early.
- Market Data API follows consistent patterns: path-based params for single-market endpoints (depth, trades, kline), query params for filters/pagination.
- Command test strategy: test 3 representative cases (no params, required params, optional params) rather than all 15 endpoints—API tests already verify the methods work.
- HttpClient's `retryMaxRetries` option can be set to `0` in tests to avoid timeouts during error scenarios, or skip command-level error tests since API tests cover it.

## Gotchas & Pitfalls

- WhiteBIT endpoint paths may differ by environment/docs revision; current PoC keeps the requested `/api/v4/public/tickers` and `/api/v4/trade-balance` paths exactly as specified.
- `--dry-run` should short-circuit HTTP calls before fetch; commands must skip normal stdout formatting in dry-run mode to keep output clean.
