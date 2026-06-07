import { pgTable, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { workspaces } from './workspace';
import { users } from './user';

export const workspaceInvitations = pgTable('workspace_invitations', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  email: text('email').notNull(),

  token: text('token').notNull().unique(),

  expiresAt: timestamp('expires_at', {
    withTimezone: true,
  }).notNull(),

  acceptedAt: timestamp('accepted_at', {
    withTimezone: true,
  }),

  createdBy: text('created_by').notNull(),

  ...timestampFields,
});

export const workspaceInvitationsRelations = relations(workspaceInvitations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceInvitations.workspaceId],
    references: [workspaces.id],
  }),
  createdByUser: one(users, {
    fields: [workspaceInvitations.createdBy],
    references: [users.id],
  }),
}));

export const workspaceInvitationsTokenIdx = uniqueIndex('workspace_invitations_token_idx').on(workspaceInvitations.token);
export const workspaceInvitationsWorkspaceIdEmailIdx = index('workspace_invitations_workspace_id_email_idx').on(
  workspaceInvitations.workspaceId,
  workspaceInvitations.email,
);