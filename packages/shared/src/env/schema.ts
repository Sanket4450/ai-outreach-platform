import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),

  JWT_REFRESH_SECRET: z.string().min(1),

  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
