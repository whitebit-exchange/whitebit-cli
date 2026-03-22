/**
 * Typed error classes used for reliable exit code inference in cli.ts.
 * Throw these instead of plain Error at key failure points.
 *
 * @bunli/core always calls process.exit(1) for handler errors, losing instanceof
 * identity. Each typed error records its intended exit code in _pendingExitCode so
 * cli.ts can intercept the forced exit(1) and use the correct code instead.
 */

let _pendingExitCode: number | undefined;

export const getPendingExitCode = (): number | undefined => _pendingExitCode;

export class CredentialsMissingError extends Error {
  readonly type = 'CredentialsMissingError' as const;
  readonly suggestion =
    'Run `whitebit login` to save your API credentials, or pass --api-key and --api-secret.';

  constructor() {
    super('API credentials are required for this command.');
    this.name = 'CredentialsMissingError';
    _pendingExitCode = 2;
  }
}

export class ApiAuthError extends Error {
  readonly type = 'ApiAuthError' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ApiAuthError';
    _pendingExitCode = 2;
  }
}

export class RateLimitError extends Error {
  readonly type = 'RateLimitError' as const;
  readonly suggestion =
    'Wait a moment before retrying, or reduce the frequency of requests in your script.';

  constructor(message = 'Rate limit exceeded.') {
    super(message);
    this.name = 'RateLimitError';
    _pendingExitCode = 5;
  }
}

export class NetworkError extends Error {
  readonly type = 'NetworkError' as const;

  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
    _pendingExitCode = 3;
  }
}
