import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { workspaces } from './workspace';
import { contacts } from './contact';
import { senders } from './sender';
import { messages } from './message';
import { drafts } from './draft';

export const threads = pgTable('threads', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  contactId: text('contact_id').notNull(),

  senderId: text('sender_id').notNull(),

  status: text('status').notNull(),

  lastMessageAt: timestamp('last_message_at', {
    withTimezone: true,
  }),

  ...timestampFields,
});

export const threadsRelations = relations(threads, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [threads.workspaceId],
    references: [workspaces.id],
  }),
  contact: one(contacts, {
    fields: [threads.contactId],
    references: [contacts.id],
  }),
  sender: one(senders, {
    fields: [threads.senderId],
    references: [senders.id],
  }),
  messages: many(messages),
  drafts: many(drafts),
}));

export const threadsWorkspaceIdLastMessageAtIdx = index('threads_workspace_id_last_message_at_idx').on(
  threads.workspaceId,
  threads.lastMessageAt,
);
export const threadsWorkspaceIdStatusIdx = index('threads_workspace_id_status_idx').on(threads.workspaceId, threads.status);
