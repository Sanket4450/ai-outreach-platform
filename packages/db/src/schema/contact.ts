import { pgTable, text, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { softDeleteFields } from './common/soft-delete';
import { workspaces } from './workspace';
import { threads } from './thread';
import { drafts } from './draft';

export const contacts = pgTable(
  'contacts',
  {
    ...idField,

    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),

    email: text('email').notNull(),

    firstName: text('first_name'),

    lastName: text('last_name'),

    company: text('company'),

    title: text('title'),

    linkedinUrl: text('linkedin_url'),

    notes: text('notes'),

    ...softDeleteFields,

    ...timestampFields,
  },
  (table) => [
    index('contacts_workspace_id_idx').on(table.workspaceId),
    uniqueIndex('contacts_workspace_id_email_uq').on(table.workspaceId, table.email),
  ],
);

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [contacts.workspaceId],
    references: [workspaces.id],
  }),
  threads: many(threads),
  drafts: many(drafts),
}));
