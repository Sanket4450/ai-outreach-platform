import { z } from 'zod';

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1),
});

export type WebEnv = z.infer<typeof webEnvSchema>;
