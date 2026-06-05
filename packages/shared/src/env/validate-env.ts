import { z } from 'zod';

export function validateEnv<T extends z.ZodType>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    console.error('\n❌ Environment validation failed:\n');
    console.error(JSON.stringify(result.error.issues, null, 2));
    process.exit(1);
  }

  return result.data;
}
