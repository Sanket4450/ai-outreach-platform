import { THREAD_STATUSES } from '@repo/types';
import { z } from 'zod';

export const listThreadsQuerySchema = z.object({
  status: z.enum(THREAD_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListThreadsQuery = z.infer<typeof listThreadsQuerySchema>;
