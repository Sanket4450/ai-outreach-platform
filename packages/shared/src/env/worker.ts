import { z } from 'zod';

export const workerEnvSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']),
  PORT: z.coerce.number().int().positive(),

  DB_URL: z.url(),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive(),
  REDIS_PASSWORD: z.string().min(1),

  SENTRY_DSN: z.string().optional(),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;
