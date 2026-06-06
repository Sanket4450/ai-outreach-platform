import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { idField } from './common/id';
import { timestampFields } from './common/timestampts';

export const workspaceMembers = pgTable('workspace_members', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  userId: text('user_id').notNull(),

  role: text('role').notNull(),

  ...timestampFields,
});
