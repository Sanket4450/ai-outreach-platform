import { z } from 'zod';
import { SENDER_PROVIDERS, THREAD_STATUSES, DRAFT_STATUSES } from './enums';

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

// ── Contacts ──────────────────────────────────────────────────────────────────

export const createContactSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  linkedinUrl: z.string().url().optional(),
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

// ── Senders ───────────────────────────────────────────────────────────────────

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

// ── Threads ───────────────────────────────────────────────────────────────────

export const listThreadsQuerySchema = z.object({
  status: z.enum(THREAD_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ── Messages ──────────────────────────────────────────────────────────────────

export const createMessageSchema = z.object({
  threadId: z.string().uuid(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(50000),
});

export const listMessagesQuerySchema = z.object({
  threadId: z.string().uuid(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ── Drafts ────────────────────────────────────────────────────────────────────

export const createDraftSchema = z.object({});

export const updateDraftSchema = z.object({
  subject: z.string().min(0).max(500).optional(),
  body: z.string().min(0).max(50000).optional(),
  contactId: z.string().uuid().optional(),
  senderId: z.string().uuid().optional(),
});

export const listDraftsQuerySchema = z.object({
  status: z.enum(DRAFT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
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
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
export type CreateSenderInput = z.infer<typeof createSenderSchema>;
export type UpdateSenderInput = z.infer<typeof updateSenderSchema>;
export type ListSendersQuery = z.infer<typeof listSendersQuerySchema>;
export type ListThreadsQuery = z.infer<typeof listThreadsQuerySchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
export type ListDraftsQuery = z.infer<typeof listDraftsQuerySchema>;
