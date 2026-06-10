import { createDb } from '@repo/db';
import { env } from './env';

export const db = createDb(env.DB_URL);
