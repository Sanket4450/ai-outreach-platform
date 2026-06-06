import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { MESSAGE_DIRECTIONS } from '@repo/shared';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';

export const messages = pgTable('messages', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  threadId: text('thread_id').notNull(),

  providerMessageId: text('provider_message_id'),

  direction: text('direction', {
    enum: MESSAGE_DIRECTIONS,
  }).notNull(),

  status: text('status').notNull(),

  subject: text('subject').notNull(),

  body: text('body').notNull(),

  scheduledFor: timestamp('scheduled_for', {
    withTimezone: true,
  }),

  sentAt: timestamp('sent_at', {
    withTimezone: true,
  }),

  deliveredAt: timestamp('delivered_at', {
    withTimezone: true,
  }),

  ...timestampFields,
});
