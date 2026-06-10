import 'dotenv/config';

import { workerEnvSchema, validateEnv } from '@repo/shared';

export const env = validateEnv(workerEnvSchema);
