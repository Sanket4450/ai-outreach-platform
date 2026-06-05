import path from 'path';

import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: path.resolve(process.cwd(), 'apps/api/.env'),
});

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/**/*',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
