import { z } from 'zod';

const workerEnvSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']),
  PORT: z.int(),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.int(),
  REDIS_PASSWORD: z.string().min(1),
  SENTRY_DSN: z.string().optional(),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;
