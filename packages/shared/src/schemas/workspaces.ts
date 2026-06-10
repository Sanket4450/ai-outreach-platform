import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(200),
});

export const createInvitationSchema = z.object({
  email: z.email(),
});

export const registerFromInvitationSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  password: z.string().min(8).max(128),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type RegisterFromInvitationInput = z.infer<typeof registerFromInvitationSchema>;
