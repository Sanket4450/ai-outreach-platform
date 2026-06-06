import { pgTable, text } from 'drizzle-orm/pg-core';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';

export const drafts = pgTable('drafts', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  threadId: text('thread_id'),

  senderId: text('sender_id').notNull(),

  contactId: text('contact_id').notNull(),

  subject: text('subject').notNull().default(''),

  body: text('body').notNull().default(''),

  ...timestampFields,
});
