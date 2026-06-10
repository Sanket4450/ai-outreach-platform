import { z } from 'zod';

export const createMessageSchema = z.object({
  threadId: z.string().uuidv7(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(50000),
});

export const listMessagesQuerySchema = z.object({
  threadId: z.string().uuidv7(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
