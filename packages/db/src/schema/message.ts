import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { MESSAGE_DIRECTIONS } from '@repo/shared';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { workspaces } from './workspace';
import { threads } from './thread';
import { webhookEvents } from './webhook-event';
import { softDeleteFields } from './common/soft-delete';

export const messages = pgTable(
  'messages',
  {
    ...idField,

    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),

    threadId: text('thread_id')
      .notNull()
      .references(() => threads.id, { onDelete: 'cascade' }),

    providerMessageId: text('provider_message_id').unique(),

    direction: text('direction', {
      enum: MESSAGE_DIRECTIONS,
    }).notNull(),

    status: text('status').notNull(),

    fromEmail: text('from_email').notNull(),

    toEmail: text('to_email').notNull(),

    fromName: text('from_name'),

    toName: text('to_name'),

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

    bouncedAt: timestamp('bounced_at', {
      withTimezone: true,
    }),

    firstOpenedAt: timestamp('first_opened_at', {
      withTimezone: true,
    }),

    firstClickedAt: timestamp('first_clicked_at', {
      withTimezone: true,
    }),

    ...softDeleteFields,

    ...timestampFields,
  },
  (table) => [
    index('messages_thread_id_created_at_idx').on(table.threadId, table.createdAt),
    index('messages_status_idx').on(table.status),
    index('messages_status_scheduled_for_idx').on(table.status, table.scheduledFor),
  ],
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [messages.workspaceId],
    references: [workspaces.id],
  }),
  thread: one(threads, {
    fields: [messages.threadId],
    references: [threads.id],
  }),
  webhookEvents: many(webhookEvents),
}));

