import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { softDeleteFields } from './common/soft-delete';
import { workspaceMembers } from './workspace-member';

export const users = pgTable('users', {
  ...idField,

  email: text('email').notNull().unique(),

  passwordHash: text('password_hash').notNull(),

  firstName: text('first_name').notNull(),

  lastName: text('last_name'),

  isEmailVerified: boolean('is_email_verified').notNull().default(false),

  ...softDeleteFields,

  ...timestampFields,
});

export const usersRelations = relations(users, ({ many }) => ({
  workspaceMembers: many(workspaceMembers),
}));
