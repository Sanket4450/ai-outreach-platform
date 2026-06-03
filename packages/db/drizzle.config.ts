import { defineConfig } from 'drizzle-kit'
import { env } from '@repo/shared';

export default defineConfig({
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
})
