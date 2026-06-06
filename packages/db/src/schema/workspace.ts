import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { workspaceMembers } from './workspace-member';
import { contacts } from './contact';
import { senders } from './sender';
import { threads } from './thread';
import { messages } from './message';
import { drafts } from './draft';
import { webhookEvents } from './webhook-event';

export const workspaces = pgTable('workspaces', {
  ...idField,

  name: text('name').notNull(),

  ...timestampFields,
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  workspaceMembers: many(workspaceMembers),
  contacts: many(contacts),
  senders: many(senders),
  threads: many(threads),
  messages: many(messages),
  drafts: many(drafts),
  webhookEvents: many(webhookEvents),
}));