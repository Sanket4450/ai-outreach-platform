import { z } from 'zod';

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']),
  PORT: z.int(),
  DB_URL: z.string().min(1),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.int(),
  REDIS_PASSWORD: z.string().min(1),
  SENTRY_DSN: z.string().optional(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
