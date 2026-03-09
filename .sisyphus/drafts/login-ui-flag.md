# Draft: Login --ui Flag (Interactive Web Credential Input)

## Requirements (confirmed)
- Add `--ui` flag to the existing `login` command
- When `--ui` is passed, spawn a local web server with a static HTML form
- Form prompts user for API key and API secret
- Credentials MUST NOT be passed to the LLM / visible in terminal history — they stay in the browser form → server only
- The Agent (executing agent) should instruct the user to open the browser at the spawned URL to enter credentials
- After form submission, credentials are saved via existing `saveConfigProfile()` flow
- Server shuts down after credentials are received

## Technical Decisions
- **Runtime**: Bun (project uses Bun exclusively, has `Bun.serve()` available)
- **Framework**: No framework needed — `Bun.serve()` with static HTML (per project rules)
- **HTML**: Inline/embedded static HTML form (no external dependencies, no React, no bundling)
- **Port**: Random available port (or fixed port like 8642?)
- **Security**: Credentials only traverse localhost, never leave the machine
- **Existing patterns**: Login command already in `src/commands/login.ts`, uses `runLogin()` which calls `saveConfigProfile()` from `src/lib/config.ts`

## Research Findings
- CLI is TypeScript/Bun, using `@bunli/core` for command definitions
- Login command at `src/commands/login.ts` — supports inline flags (`--api-key`, `--api-secret`) or interactive TTY readline
- Config is saved to `~/.whitebit/config.toml` as TOML with 0600 permissions
- Boolean flags exist in codebase: `z.boolean().optional()` pattern
- `Bun.serve()` is recommended per project rules (`.cursor/rules/use-bun-instead-of-node-vite-npm-pnpm.mdc`)
- No existing web server code in the project — this is greenfield

## Open Questions
- ~~Port selection strategy: random vs fixed?~~ → OS-assigned (port 0)
- ~~Should the form include profile name and API URL fields too?~~ → Yes, all fields (mirrors TTY flow)
- ~~After credentials submitted: auto-open browser or just print URL?~~ → Print URL only
- Should there be a timeout for the server? → TBD (will default to reasonable timeout)

## User Decisions
- **Browser**: Print URL only, do NOT auto-open browser
- **Form fields**: All fields (Profile, API Key, API Secret, API URL) — mirrors TTY flow
- **Port**: OS-assigned (port 0), URL printed to terminal
- **Tests**: Yes, tests after implementation (project has bun test infrastructure)

## Scope Boundaries
- INCLUDE: `--ui` flag, local Bun.serve(), static HTML form, credential saving, tests
- EXCLUDE: HTTPS, external auth providers, persistent web server, auto-opening browser
