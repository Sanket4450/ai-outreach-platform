import { SENDER_PROVIDERS } from '@repo/types';
import { z } from 'zod';

export const createSenderSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  provider: z.enum(SENDER_PROVIDERS as unknown as [string, ...string[]]),
  providerConfig: z.record(z.string(), z.unknown()).optional().default({}),
});

export const updateSenderSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.email().optional(),
  provider: z.enum(SENDER_PROVIDERS as unknown as [string, ...string[]]).optional(),
  providerConfig: z.record(z.string(), z.unknown()).optional(),
});

export const listSendersQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateSenderInput = z.infer<typeof createSenderSchema>;
export type UpdateSenderInput = z.infer<typeof updateSenderSchema>;
export type ListSendersQuery = z.infer<typeof listSendersQuerySchema>;
