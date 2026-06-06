import { jsonb, pgTable, text } from 'drizzle-orm/pg-core';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';

export const senders = pgTable('senders', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  name: text('name').notNull(),

  email: text('email').notNull(),

  provider: text('provider').notNull(),

  providerConfig: jsonb('provider_config'),

  ...timestampFields,
});
