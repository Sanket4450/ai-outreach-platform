import { timestamp } from 'drizzle-orm/pg-core';

export const softDeleteFields = {
  deletedAt: timestamp('deleted_at', {
    withTimezone: true,
  }),
};
