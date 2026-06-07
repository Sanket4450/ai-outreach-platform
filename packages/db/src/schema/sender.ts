import { jsonb, pgTable, text, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { workspaces } from './workspace';
import { threads } from './thread';
import { drafts } from './draft';

export const senders = pgTable('senders', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  name: text('name').notNull(),

  email: text('email').notNull(),

  provider: text('provider').notNull(),

  providerConfig: jsonb('provider_config'),

  ...timestampFields,
});

export const sendersRelations = relations(senders, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [senders.workspaceId],
    references: [workspaces.id],
  }),
  threads: many(threads),
  drafts: many(drafts),
}));

export const sendersWorkspaceIdIdx = index('senders_workspace_id_idx').on(senders.workspaceId);
export const sendersWorkspaceIdProviderEmailUq = uniqueIndex(
  'senders_workspace_id_provider_email_uq',
).on(senders.workspaceId, senders.provider, senders.email);
