import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idField } from './common/id';
import { timestampFields } from './common/timestampts';

export const emailVerifications = pgTable('email_verifications', {
  ...idField,

  email: text('email').notNull(),

  otp: text('otp').notNull(),

  expiresAt: timestamp('expires_at', {
    withTimezone: true,
  }).notNull(),

  ...timestampFields,
});
