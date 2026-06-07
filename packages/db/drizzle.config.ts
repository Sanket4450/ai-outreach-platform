import path from 'path';

import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: path.resolve(process.cwd(), '../../apps/api/.env'),
});

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  throw new Error('DB_URL environment variable is not defined');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/**/*',
  out: './drizzle',
  dbCredentials: {
    url: dbUrl,
  },
});
