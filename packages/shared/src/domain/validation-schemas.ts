import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const checkEmailSchema = z.object({
  email: z.email(),
});

export const registerUserSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  password: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

export const resendVerificationEmailSchema = z.object({
  email: z.email(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// ── Workspaces ────────────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(200),
});

// ── Workspace Invitations ─────────────────────────────────────────────────────

export const createInvitationSchema = z.object({
  email: z.email(),
});

export const registerFromInvitationSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  password: z.string().min(8).max(128),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type CheckEmailInput = z.infer<typeof checkEmailSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type RegisterFromInvitationInput = z.infer<typeof registerFromInvitationSchema>;
