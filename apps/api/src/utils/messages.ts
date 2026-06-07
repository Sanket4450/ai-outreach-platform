export const MESSAGES = {
  success: {},
  error: {
    EMAIL_ALREADY_REGISTERED: 'Email already registered',
    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_VERIFIED: 'Email already verified',
    INVALID_OR_EXPIRED_OTP: 'Invalid or expired verification code',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_NOT_VERIFIED: 'Email not verified',
    NOT_WORKSPACE_OWNER: 'Only workspace owners can invite members',
    INVITATION_INVALID_OR_EXPIRED: 'Invitation is invalid or expired',
    INVITATION_EMAIL_MISMATCH: 'This invitation was sent to {{email}}',
    ALREADY_WORKSPACE_MEMBER: 'Already a member of this workspace',
  },
} as const;
