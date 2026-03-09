import type { z } from 'zod';

export function parseArg<T>(
  value: string | undefined,
  schema: z.ZodType<T>,
  argName: string,
  usage: string,
): T {
  if (value === undefined) {
    console.error(`Error: Missing required argument: ${argName}`);
    console.error(`\nUsage: ${usage}`);
    process.exit(1);
  }

  try {
    return schema.parse(value);
  } catch {
    console.error(`Error: Invalid ${argName}: ${value}`);
    console.error(`\nUsage: ${usage}`);
    process.exit(1);
  }
}
