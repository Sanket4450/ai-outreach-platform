import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { workspaces } from './workspace';
import { threads } from './thread';
import { senders } from './sender';
import { contacts } from './contact';

export const drafts = pgTable('drafts', {
  ...idField,

  workspaceId: text('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),

  threadId: text('thread_id').references(() => threads.id, { onDelete: 'set null' }),

  senderId: text('sender_id')
    .notNull()
    .references(() => senders.id, { onDelete: 'restrict' }),

  contactId: text('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),

  subject: text('subject').notNull().default(''),

  body: text('body').notNull().default(''),

  ...timestampFields,
});

export const draftsRelations = relations(drafts, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [drafts.workspaceId],
    references: [workspaces.id],
  }),
  thread: one(threads, {
    fields: [drafts.threadId],
    references: [threads.id],
  }),
  sender: one(senders, {
    fields: [drafts.senderId],
    references: [senders.id],
  }),
  contact: one(contacts, {
    fields: [drafts.contactId],
    references: [contacts.id],
  }),
}));
