# Login UI Server Implementation Learnings

## Task: Create login-ui-server.ts module

### Completed
- ✅ Implemented `startLoginUIServer(defaults?: { profile?: string; apiUrl?: string })` function
- ✅ Returns Promise<LoginUIResult> with shape `{ profile, apiKey, apiSecret, apiUrl }`
- ✅ Embedded HTML form as template literal (no separate files)
- ✅ Server binds to 127.0.0.1:0 (OS-assigned port)
- ✅ SIGINT handler for cleanup
- ✅ Type checking passes (bunx tsc --noEmit)
- ✅ Linting passes (bunx biome check)

### Implementation Details

#### Server Configuration
- Uses `Bun.serve()` with `port: 0` (OS-assigned) and `hostname: "127.0.0.1"`
- Proper TypeScript typing: `Server<undefined>` (Bun's Server type requires generic parameter)
- Returns Promise that resolves on first valid form submission

#### Routes
1. **GET /** → HTML form with 4 fields (profile, apiKey, apiSecret, apiUrl)
2. **POST /submit** → JSON body validation and credential return
3. **Any other** → 404 response

#### HTML/CSS Design
- Clean, centered card layout with WhiteBIT purple gradient (135deg, #667eea to #764ba2)
- Form fields: Profile (text, default), API Key (text, required), API Secret (password, required), API URL (text, default)
- Inline vanilla JS with fetch() for form submission
- Success/error messages displayed inline
- Button states: normal, hover (lift effect), disabled, success

#### Validation & Security
- Server-side validation: apiKey and apiSecret must be non-empty strings
- Guard flag prevents multiple submissions after first success
- Proper type safety: `unknown` body cast to `Record<string, unknown>` with type guards
- No credentials echoed back in responses (only `{ success: true }`)

#### Cleanup & Lifecycle
- SIGINT handler calls `server.stop()` and rejects Promise
- 100ms delay before server shutdown after successful submission (allows response to complete)
- Process event listener cleanup in cleanup function

### Key Design Decisions

1. **Embedded HTML Template Literal**
   - Required for compiled binary compatibility (no external file dependencies)
   - Template literal allows dynamic default value injection

2. **Type Safety**
   - Avoided `any` type (Biome violation)
   - Used `unknown` → `Record<string, unknown>` with proper type guards
   - Explicit type checks for all body properties

3. **Promise Pattern**
   - Promise resolves on first valid submission
   - Rejects on SIGINT or server errors
   - Guard flag prevents race conditions from multiple submissions

4. **Defaults Handling**
   - Server accepts optional defaults for profile and apiUrl
   - HTML form uses these defaults as initial values
   - Client-side JS falls back to defaults if fields are empty

### Code Comments Justification
No comments were added. The code is self-documenting:
- Function names clearly describe their purpose (`cleanup`, `handleSigInt`, `getHTMLPage`)
- Variable names are explicit (`hasResolved`, `bodyData`, `resultPromise`)
- Control flow is straightforward with clear validation steps

### Testing Results
- ✅ Server starts without errors
- ✅ Binds to 127.0.0.1 with OS-assigned port
- ✅ Exports verified: `startLoginUIServer` function and `LoginUIResult` type
- ✅ TypeScript compilation succeeds
- ✅ Biome linting passes with no warnings

### Dependencies Used
- `bun` - `Server` type and `Bun.serve()` API
- No additional npm packages required

### Files Created
- `src/lib/login-ui-server.ts` - Main module (384 lines)

## Task: Integrate --ui flag into login command

### Completed
- ✅ Added `ui: option(z.boolean().optional(), {...})` to `loginCommand.options` (line 167-169)
- ✅ Imported `startLoginUIServer` from `../lib/login-ui-server` (line 8)
- ✅ Updated `runLogin()` function signature to include `ui?: boolean` flag (line 71)
- ✅ Implemented `--ui` branch before `hasInlineCredentials` check (lines 73-107)
- ✅ Added mutual exclusivity validation: error if `--ui` combined with `--api-key` or `--api-secret` (lines 74-79)
- ✅ Called `startLoginUIServer()` with profile and apiUrl defaults (lines 81-84)
- ✅ Set `interactive: 'ui'` in formatOutput to distinguish from TTY/inline modes (line 102)
- ✅ Type checking passes with no login-related errors (bunx tsc --noEmit)
- ✅ Linting passes with no issues (bunx biome check src/commands/login.ts)

### Integration Details

#### Option Definition
- Pattern follows existing `postOnly` boolean option from `src/commands/trade/limit-order.ts:33`
- Uses `z.boolean().optional()` schema with descriptive help text
- No breaking changes to existing options

#### Control Flow in runLogin()
```
1. if (flags.ui) → UI server path
   a. Validate: no --api-key/--api-secret
   b. Call startLoginUIServer()
   c. Save credentials and format output with interactive: 'ui'
   d. Return early

2. else → existing TTY or inline credential paths
   a. Check hasInlineCredentials
   b. Either load inline or collect interactive values
   c. Same save/format flow (with interactive: true/false)
```

#### Key Implementation Choices
1. **Early Return on UI Path** - Prevents fallthrough to TTY/inline paths
2. **Mutual Exclusivity** - Explicit error message guides users to correct usage
3. **Interactive Mode Identifier** - `interactive: 'ui'` allows output formatter to distinguish UI login from TTY
4. **No Breaking Changes** - Existing TTY and inline flows untouched
5. **Error Messages** - Clear, actionable error message for flag conflicts

### Type Safety
- Function signature properly types the ui flag as optional boolean
- startLoginUIServer() return type (LoginUIResult) matches LoginValues interface
- No type errors in modified file
- All branches properly handle credential objects

### Next Steps
This integration enables:
1. `whitebit login --ui` to open browser-based login UI
2. Secure credential entry via local web interface
3. Distinction between UI, TTY, and inline authentication methods in output

### Notes
- Server port information (127.0.0.1:PORT) should be printed before starting server if desired (currently startLoginUIServer starts listening on OS-assigned port 0 before returning to caller)
- formatOutput implementation determines how to display the `interactive: 'ui'` value in the output object

## Task: Create comprehensive tests for login UI feature

### Completed
- ✅ Created `test/commands/login-ui.test.ts` with 9 comprehensive tests
- ✅ All 9 tests passing: `bun test test/commands/login-ui.test.ts`
- ✅ Full test suite passes (267 pass, 21 pre-existing failures unrelated to login UI)
- ✅ Tests use temp directory isolation (pattern from `test/lib/config.test.ts`)
- ✅ Tests use HTTP requests (fetch) not browser automation
- ✅ Proper cleanup in afterEach hooks

### API Changes Required for Testing

To enable testability, modified `startLoginUIServer()` return type:

**Before:**
```typescript
export const startLoginUIServer = (...) => Promise<LoginUIResult>
```

**After:**
```typescript
export interface LoginUIServerResult {
  promise: Promise<LoginUIResult>;
  server: Server<undefined>;
}

export const startLoginUIServer = (...) => LoginUIServerResult
```

**Rationale:**
- Tests need access to `server.port` to make HTTP requests
- Previous design returned Promise only, hiding server object
- New design returns both promise and server for testability
- Updated `src/commands/login.ts` to use `{ promise } = startLoginUIServer()`

### Test Implementation Details

#### Test Coverage (9 tests, all passing)

1. **server serves HTML form with all required fields** 
   - Verifies GET / returns 200 with text/html Content-Type
   - Checks HTML contains `<form`, all field labels, and input IDs
   
2. **valid form submission returns success response**
   - POST /submit with valid credentials
   - Verifies `{ success: true }` response
   - Verifies promise resolves with correct LoginUIResult values

3. **missing apiKey returns validation error**
   - POST with empty apiKey string
   - Verifies `{ success: false, error: "API key is required" }`

4. **missing apiSecret returns validation error**
   - POST with empty apiSecret string
   - Verifies `{ success: false, error: "API secret is required" }`

5. **unknown route returns 404**
   - GET /unknown
   - Verifies 404 status code

6. **server stops after successful submission**
   - POST valid credentials
   - Wait for promise resolution + 150ms
   - Attempt new connection → must fail (ECONNREFUSED)

7. **runLogin throws error when --ui combined with --api-key**
   - Tests flag mutual exclusivity validation

8. **runLogin throws error when --ui combined with --api-secret**
   - Tests flag mutual exclusivity validation

9. **runLogin throws error when --ui combined with both credentials**
   - Tests flag mutual exclusivity validation

#### Test Pattern & Structure

**Environment isolation:**
```typescript
beforeEach: mkdtemp → set HOME/USERPROFILE env vars
afterEach: rm temp dir → restore original env vars
```

**Server lifecycle:**
```typescript
beforeEach: (nothing - lazy server creation in tests)
afterEach: POST cleanup credentials → wait for promise/timeout → set serverResult = null
```

**Type safety:**
```typescript
interface JsonResponse { success: boolean; error?: string }
const json = (await response.json()) as JsonResponse
```

### Critical Discovery: server.stop() Behavior

**Problem:** Test "server stops after successful submission" initially failed - server kept accepting connections after `server.stop()` call.

**Root cause:** `Bun.serve()` server.stop() has graceful shutdown by default, allowing in-flight requests to complete.

**Solution:** Use force flag: `server.stop(true)`

**Implementation change in `src/lib/login-ui-server.ts`:**
```typescript
const cleanup = () => {
  if (server) {
    server.stop(true);  // Force immediate shutdown
  }
  process.off('SIGINT', handleSigInt);
};
```

**Why this works:**
- `server.stop()` - graceful shutdown (waits for active connections)
- `server.stop(true)` - force immediate shutdown (closes all connections)
- For login UI use case, force shutdown is appropriate since we've already sent response

### Files Created
- `test/commands/login-ui.test.ts` - 215 lines, 9 tests, comprehensive coverage

### Files Modified
- `src/lib/login-ui-server.ts` - Changed return type from Promise to LoginUIServerResult object
- `src/lib/login-ui-server.ts` - Changed `server.stop()` to `server.stop(true)` for immediate shutdown
- `src/commands/login.ts` - Updated to use `{ promise } = startLoginUIServer()`

### Testing Best Practices Applied

1. **No comments in test code** - Test names and code are self-documenting
2. **Temp directory isolation** - Each test gets fresh HOME directory
3. **Proper cleanup** - afterEach always runs cleanup regardless of test result
4. **Type safety** - Explicit JsonResponse interface for response validation
5. **Real HTTP requests** - No mocks, tests actual server behavior
6. **Comprehensive coverage** - Tests happy path, validation errors, routing, lifecycle

### Test Results

```bash
bun test test/commands/login-ui.test.ts
✓ 9 pass, 0 fail, 25 expect() calls [274ms]

bun test
✓ 267 pass, 21 fail (pre-existing), 572 expect() calls [529ms]
```

### Key Learnings

1. **Testability requires API design consideration** - Original Promise-only return type was not testable
2. **Bun server shutdown has graceful mode by default** - Must use `stop(true)` for immediate shutdown
3. **fetch() with AbortSignal.timeout is reliable** - Good for testing connection failures
4. **Temp directory pattern from existing tests works well** - Consistent with project patterns
5. **Testing server lifecycle requires careful timing** - Wait for promise resolution before testing shutdown
