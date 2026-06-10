import { pgTable, text, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { workspaces } from './workspace';
import { users } from './user';

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    ...idField,

    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),

    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    role: text('role').notNull(),

    ...timestampFields,
  },
  (table) => [
    index('workspace_members_workspace_id_idx').on(table.workspaceId),
    index('workspace_members_user_id_idx').on(table.userId),
    uniqueIndex('workspace_members_workspace_id_user_id_uq').on(table.workspaceId, table.userId),
  ],
);

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));
