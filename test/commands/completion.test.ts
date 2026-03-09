import { describe, expect, test } from 'bun:test';

import { completionCommand } from '../../src/commands/completion';

const captureStdout = async (run: () => Promise<void>): Promise<string> => {
  let output = '';
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string) => {
    output += chunk;
    return true;
  }) as typeof process.stdout.write;

  try {
    await run();
    return output;
  } finally {
    process.stdout.write = originalWrite;
  }
};

describe('completion command', () => {
  test('generates bash completion by default', async () => {
    const handler = completionCommand.handler;
    if (!handler) {
      throw new Error('completion handler is not defined');
    }

    const output = await captureStdout(async () => {
      await handler({ flags: {} } as never);
    });

    expect(output).toContain('_whitebit_completions');
    expect(output).toContain('complete -F _whitebit_completions whitebit');
    expect(output).toContain('trade');
    expect(output).toContain('completion');
  });

  test('generates zsh completion', async () => {
    const handler = completionCommand.handler;
    if (!handler) {
      throw new Error('completion handler is not defined');
    }

    const output = await captureStdout(async () => {
      await handler({ flags: { shell: 'zsh' } } as never);
    });

    expect(output).toContain('#compdef whitebit');
    expect(output).toContain('compdef _whitebit whitebit');
  });

  test('generates fish completion', async () => {
    const handler = completionCommand.handler;
    if (!handler) {
      throw new Error('completion handler is not defined');
    }

    const output = await captureStdout(async () => {
      await handler({ flags: { shell: 'fish' } } as never);
    });

    expect(output).toContain('complete -c whitebit -f');
    expect(output).toContain('__fish_seen_subcommand_from trade');
  });
});
