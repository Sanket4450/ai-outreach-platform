export const THREAD_STATUSES = ['waiting_reply', 'needs_action', 'closed'] as const;
export const MESSAGE_DIRECTIONS = ['inbound', 'outbound'] as const;
export const MESSAGE_STATUSES = ['scheduled', 'queued', 'sent', 'failed'] as const;
export const DRAFT_STATUSES = ['generated', 'edited', 'sent', 'discarded'] as const;
export const SENDER_PROVIDERS = ['sendgrid'] as const;
export const WEBHOOK_EVENT_TYPES = [
  'delivered',
  'bounced',
  'opened',
  'clicked',
  'spam_reported',
] as const;

export type ThreadStatus = (typeof THREAD_STATUSES)[number];
export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[number];
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export type DraftStatus = (typeof DRAFT_STATUSES)[number];
export type SenderProvider = (typeof SENDER_PROVIDERS)[number];
export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];