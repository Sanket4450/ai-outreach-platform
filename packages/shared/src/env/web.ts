import { z } from 'zod';

const webEnvSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']),
});

export type WebEnv = z.infer<typeof webEnvSchema>;
