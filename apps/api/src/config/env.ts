import 'dotenv/config';

import { apiEnvSchema, validateEnv } from '@repo/shared';

export const env = validateEnv(apiEnvSchema);
