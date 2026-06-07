# User & Workspace Flow

## Purpose

This document defines the complete end-to-end flow for:

- User registration
- Email verification
- User login
- Workspace creation
- Workspace selection
- Workspace invitations
- Invitation acceptance

This document is the source of truth for:

- Backend implementation
- Frontend implementation
- API design
- Authorization behavior

---

# Client Flow

---

# Entry Screen

## UI

Fields:

```text
Email
```

Actions:

```text
Continue
```

---

# Email Check

User enters email and clicks:

```text
Continue
```

Request:

```http
POST /auth/check-email
```

Request:

```json
{
  "email": "john@example.com"
}
```

---

# Existing User Flow

## Condition

User exists.

Response:

```json
{
  "exists": true
}
```

## UI

Show:

```text
Email (read-only)
Password
```

Actions:

```text
Login
```

---

# Login

Request:

```http
POST /auth/login
```

Request:

```json
{
  "email": "john@example.com",
  "password": "password"
}
```

---

## Success

Authentication succeeds.

Tokens issued.

Proceed to:

```text
Workspace Resolution Flow
```

---

# New User Flow

## Condition

User does not exist.

Response:

```json
{
  "exists": false
}
```

## UI

Show:

```text
Email (read-only)
First Name
Last Name (Optional)
Password
```

Actions:

```text
Create Account
```

---

# Register

Request:

```http
POST /auth/register
```

Request:

```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password"
}
```

---

## Success

User created.

User remains:

```text
isEmailVerified = false
```

OTP email sent.

Proceed to:

```text
Email Verification
```

---

# Email Verification

## UI

Show:

```text
Enter Verification Code
```

Fields:

```text
OTP (6 digits)
```

Actions:

```text
Verify
Resend Code
```

---

# Verify Email

Request:

```http
POST /auth/verify-email
```

Request:

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

---

## Success

System:

```text
marks email verified
issues access token
issues refresh token
```

Proceed to:

```text
Create First Workspace
```

---

# Resend Verification Email

Request:

```http
POST /auth/resend-verification-email
```

Request:

```json
{
  "email": "john@example.com"
}
```

Result:

```text
new OTP generated
previous OTP invalidated
verification email resent
```

Remain on verification screen.

---

# Create First Workspace

Shown immediately after successful registration and verification.

## UI

Fields:

```text
Workspace Name
```

Actions:

```text
Create Workspace
```

---

## Request

```http
POST /workspaces
```

Request:

```json
{
  "name": "Acme"
}
```

---

## Success

System creates:

```text
workspace
workspace_member
```

Membership:

```text
role = owner
```

Client stores:

```text
activeWorkspaceId
```

Redirect:

```text
Workspace Dashboard
```

---

# Workspace Resolution Flow

Executed immediately after login.

---

# Fetch Workspaces

Request:

```http
GET /workspaces
```

---

# No Workspace

Condition:

```text
workspace count = 0
```

Show:

```text
Create Workspace
```

After creation:

```text
Dashboard
```

---

# Single Workspace

Condition:

```text
workspace count = 1
```

System automatically:

```text
sets activeWorkspaceId
```

Redirect:

```text
Dashboard
```

---

# Multiple Workspaces

Condition:

```text
workspace count > 1
```

Show:

```text
Workspace Picker
```

Example:

```text
Acme
Growth Agency
Sales Team
```

User selects workspace.

System stores:

```text
activeWorkspaceId
```

Redirect:

```text
Dashboard
```

---

# Workspace Switching

Accessible from workspace switcher UI.

Request:

```http
GET /workspaces
```

User selects another workspace.

Client updates:

```text
activeWorkspaceId
```

All subsequent API requests use:

```text
activeWorkspaceId
```

---

# Workspace Invitation Flow

---

# Invite User

Permission:

```text
owner only
```

---

## UI

Fields:

```text
Email
```

Actions:

```text
Send Invitation
```

---

## Request

```http
POST /workspace-invitations
```

Request:

```json
{
  "email": "jane@example.com"
}
```

---

## Success

System creates:

```text
workspace_invitation
```

Fields:

```text
workspaceId
email
token
expiresAt
createdBy
```

Invitation email sent.

Email contains:

```text
Accept Invitation
```

link.

---

# Invitation Link Opened

Example:

```text
/accept-invitation?token=xxx
```

Request:

```http
GET /workspace-invitations/:token
```

---

# Invalid Invitation

Condition:

```text
token invalid
```

Show:

```text
Invitation Invalid
```

---

# Expired Invitation

Condition:

```text
expiresAt < now
```

Show:

```text
Invitation Expired
```

---

# Valid Invitation

Show:

```text
Workspace Name
Invited Email
```

Actions:

```text
Accept Invitation
```

---

# Existing User Invitation Flow

Condition:

```text
user account exists
```

---

## Authentication Required

If not logged in:

```text
redirect to login
```

After login:

```text
return to invitation page
```

---

## Email Validation

Authenticated email must equal:

```text
invitation.email
```

Otherwise:

```text
show error
```

Example:

```text
This invitation was sent to jane@example.com
```

---

## Accept Invitation

Request:

```http
POST /workspace-invitations/:token/accept
```

---

## Success

System:

```text
creates workspace_member
marks invitation accepted
sets acceptedAt
```

Client updates:

```text
activeWorkspaceId
```

Redirect:

```text
Workspace Dashboard
```

---

# New User Invitation Flow

Condition:

```text
user account does not exist
```

---

## UI

Fields:

```text
Email (read-only)
First Name
Last Name (Optional)
Password
```

Actions:

```text
Create Account & Join Workspace
```

---

## Request

```http
POST /workspace-invitations/:token/register
```

Request:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "password": "password"
}
```

---

## Success

System:

```text
creates user
marks email verified
creates workspace_member
marks invitation accepted
issues access token
issues refresh token
```

Client stores:

```text
activeWorkspaceId
```

Redirect:

```text
Workspace Dashboard
```

---

# API Flow

---

# Check Email

Endpoint:

```http
POST /auth/check-email
```

Purpose:

```text
determine login or registration flow
```

Flow:

1. Validate email
2. Lookup user
3. Return exists flag

---

# Register User

Endpoint:

```http
POST /auth/register
```

Flow:

1. Validate payload
2. Ensure email unique
3. Hash password
4. Create user
5. Generate OTP
6. Store OTP
7. Send verification email
8. Return success

Tokens are NOT issued.

---

# Verify Email

Endpoint:

```http
POST /auth/verify-email
```

Flow:

1. Validate OTP
2. Ensure OTP exists
3. Ensure OTP not expired
4. Mark email verified
5. Delete OTP
6. Issue tokens
7. Return success

---

# Resend Verification Email

Endpoint:

```http
POST /auth/resend-verification-email
```

Flow:

1. Ensure user exists
2. Ensure email not verified
3. Invalidate existing OTP
4. Generate new OTP
5. Store OTP
6. Send email
7. Return success

---

# Login

Endpoint:

```http
POST /auth/login
```

Flow:

1. Find user
2. Verify password
3. Ensure email verified
4. Issue tokens
5. Return success

---

# Create Workspace

Endpoint:

```http
POST /workspaces
```

Flow:

1. Validate payload
2. Create workspace
3. Create workspace member
4. Assign owner role
5. Return workspace

---

# List Workspaces

Endpoint:

```http
GET /workspaces
```

Flow:

1. Resolve user
2. Fetch memberships
3. Return workspaces

---

# Create Invitation

Endpoint:

```http
POST /workspace-invitations
```

Flow:

1. Resolve user
2. Ensure owner role
3. Generate secure token
4. Create invitation
5. Set expiration
6. Send email
7. Return success

---

# Get Invitation

Endpoint:

```http
GET /workspace-invitations/:token
```

Flow:

1. Lookup invitation
2. Validate token
3. Ensure not expired
4. Ensure not accepted
5. Return invitation

---

# Accept Invitation

Endpoint:

```http
POST /workspace-invitations/:token/accept
```

Flow:

1. Resolve user
2. Validate invitation
3. Ensure emails match
4. Ensure membership doesn't exist
5. Create membership
6. Set acceptedAt
7. Return workspace

---

# Register From Invitation

Endpoint:

```http
POST /workspace-invitations/:token/register
```

Flow:

1. Validate invitation
2. Ensure invitation valid
3. Ensure user doesn't exist
4. Create user
5. Mark email verified
6. Create membership
7. Set acceptedAt
8. Issue tokens
9. Return workspace

---

# Ownership Rules

## Owner

Can:

- Manage workspace
- Invite members
- View members
- Remove members

---

## Member

Can:

- Manage contacts
- Manage senders
- Manage drafts
- Manage threads
- Manage messages

Cannot:

- Invite members
- Remove members
- Manage workspace

---

# Invariants

1. Every workspace must have at least one owner.
2. Workspace creator automatically becomes owner.
3. A user cannot join the same workspace twice.
4. Invitation email must match accepting user email.
5. Unverified users cannot log in.
6. Invitation tokens are single-use.
7. Accepted invitations cannot be reused.
8. Expired invitations cannot be accepted.
9. Only owners can invite members.
10. Single workspace users skip workspace selection.
11. New users must create a workspace before platform usage.
12. Previous OTPs become invalid after resend.
13. Tokens are issued only after successful verification.
14. Active workspace must always belong to the authenticated user.
