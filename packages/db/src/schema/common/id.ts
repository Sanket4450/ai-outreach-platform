import { text } from 'drizzle-orm/pg-core';

export const idField = {
  id: text('id').primaryKey(),
};
