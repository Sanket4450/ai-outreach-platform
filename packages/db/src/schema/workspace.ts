import { pgTable, text } from 'drizzle-orm/pg-core';
import { idField } from './common/id';
import { timestampFields } from './common/timestampts';

export const workspaces = pgTable('workspaces', {
  ...idField,

  name: text('name').notNull(),

  ...timestampFields,
});
