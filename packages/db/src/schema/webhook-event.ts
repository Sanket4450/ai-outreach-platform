import { jsonb, pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { WEBHOOK_EVENT_TYPES } from '@repo/shared';
import { workspaces } from './workspace';
import { messages } from './message';

export const webhookEvents = pgTable('webhook_events', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  messageId: text('message_id').notNull(),

  provider: text('provider').notNull(),

  eventType: text('event_type', {
    enum: WEBHOOK_EVENT_TYPES,
  }).notNull(),

  payload: jsonb('payload').notNull(),

  occurredAt: timestamp('occurred_at', {
    withTimezone: true,
  }).notNull(),

  ...timestampFields,
});

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [webhookEvents.workspaceId],
    references: [workspaces.id],
  }),
  message: one(messages, {
    fields: [webhookEvents.messageId],
    references: [messages.id],
  }),
}));

export const webhookEventsMessageIdIdx = index('webhook_events_message_id_idx').on(webhookEvents.messageId);
export const webhookEventsWorkspaceIdIdx = index('webhook_events_workspace_id_idx').on(webhookEvents.workspaceId);
export const webhookEventsMessageIdOccurredAtIdx = index('webhook_events_message_id_occurred_at_idx').on(
  webhookEvents.messageId,
  webhookEvents.occurredAt,
);
