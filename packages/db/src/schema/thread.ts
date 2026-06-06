import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';

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
