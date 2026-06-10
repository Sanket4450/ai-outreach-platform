import { z } from 'zod';

export const createContactSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  linkedinUrl: z.url().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateContactSchema = z.object({
  email: z.email().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(2000).optional(),
});

export const listContactsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
