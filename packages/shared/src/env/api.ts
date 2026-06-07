import { z } from 'zod';

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']),
  PORT: z.int(),

  DB_URL: z.string().min(1),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.int(),
  REDIS_PASSWORD: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  SENTRY_DSN: z.string().optional(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
