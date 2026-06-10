import { DRAFT_STATUSES } from '@repo/types';
import { z } from 'zod';

export const createDraftSchema = z.object({});

export const updateDraftSchema = z.object({
  subject: z.string().min(0).max(500).optional(),
  body: z.string().min(0).max(50000).optional(),
  contactId: z.uuidv7().optional(),
  senderId: z.uuidv7().optional(),
});

export const listDraftsQuerySchema = z.object({
  status: z.enum(DRAFT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
export type ListDraftsQuery = z.infer<typeof listDraftsQuerySchema>;
