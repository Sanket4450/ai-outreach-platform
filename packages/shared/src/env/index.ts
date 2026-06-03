import dotenv from 'dotenv';

import { envSchema } from './schema';

dotenv.config();

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Environment validation failed:', result.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = result.data;
