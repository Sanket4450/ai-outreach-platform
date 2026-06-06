import { pgTable, text } from 'drizzle-orm/pg-core';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { softDeleteFields } from './common/soft-delete';

export const contacts = pgTable('contacts', {
  ...idField,

  workspaceId: text('workspace_id').notNull(),

  email: text('email').notNull(),

  firstName: text('first_name'),

  lastName: text('last_name'),

  company: text('company'),

  title: text('title'),

  linkedinUrl: text('linkedin_url'),

  notes: text('notes'),

  ...softDeleteFields,

  ...timestampFields,
});
