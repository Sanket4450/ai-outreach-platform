import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { idField } from './common/id';
import { timestampFields } from './common/timestampts';
import { softDeleteFields } from './common/soft-delete';

export const users = pgTable('users', {
  ...idField,

  email: text('email').notNull().unique(),

  passwordHash: text('password_hash').notNull(),

  firstName: text('first_name'),

  lastName: text('last_name'),

  isEmailVerified: boolean('is_email_verified').notNull().default(false),

  ...softDeleteFields,

  ...timestampFields,
});
