# Email Flow

## Purpose

This document defines the complete end-to-end flow for:

* Email sending
* Email delivery processing
* Email provider abstraction
* SendGrid integration
* Queue processing
* Worker processing
* Message delivery state management

This document is the source of truth for:

* Backend implementation
* Worker implementation
* Email provider implementation
* Queue implementation
* Frontend behavior

---

# General Flow

The platform sends outbound emails from drafts.

A draft represents email content.

A message represents email delivery state.

A thread represents conversation state.

Email delivery occurs asynchronously.

The application never sends emails directly during the HTTP request lifecycle.

Instead:

```text
Draft
    ↓
Message Created
    ↓
Queue Job Created
    ↓
Worker Processing
    ↓
Email Provider
    ↓
SendGrid
    ↓
Message Updated
```

---

# Responsibilities

---

# Draft Responsibility

A draft owns:

```text
contactId
senderId
threadId

subject
body
```

A draft represents:

```text
email composition
```

---

# Thread Responsibility

A thread owns:

```text
contactId
senderId
status
lastMessageAt
```

A thread represents:

```text
conversation state
```

Examples:

```text
waiting_reply
needs_action
closed
```

---

# Message Responsibility

A message owns:

```text
threadId
direction
status
providerMessageId
```

A message represents:

```text
email delivery state
```

Examples:

```text
queued
sent
failed
```

---

# Architecture Flow

```text
apps/web
    ↓
apps/api
    ↓
Redis
    ↓
BullMQ
    ↓
apps/worker
    ↓
packages/email
    ↓
SendGrid
```

---

# End To End Flow

```text
Draft
    ↓
POST /drafts/:id/send
    ↓
Thread Resolution
    ↓
Message Creation
    ↓
Queue Job Created
    ↓
HTTP Response Returned
    ↓
Worker Picks Job
    ↓
SendGrid Delivery
    ↓
Message Updated
```

---

# Packages Flow

---

# packages/email

Purpose:

```text
Email Provider Abstraction
```

Application code only accesses:

```ts
emailProvider.send()
```

Application code never accesses:

```ts
sendgrid.send()
```

directly.

---

# Email Provider Contract

```ts
interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
```

---

# Send Email Input

```ts
type SendEmailInput = {
  fromEmail: string;
  fromName?: string;

  toEmail: string;
  toName?: string;

  subject: string;
  body: string;
};
```

---

# Send Email Result

```ts
type SendEmailResult = {
  providerMessageId: string;
};
```

---

# SendGrid Provider

Implementation:

```text
SendGridEmailProvider
```

Responsibilities:

```text
Authentication
Email Delivery
Response Mapping
Provider Message Extraction
```

---

# Web Flow

---

# Draft Details

User opens:

```text
Draft Details
```

Displays:

```text
Subject
Body
Contact
Sender
```

---

# Send Draft

User selects:

```text
Send Draft
```

Request:

```http
POST /drafts/:id/send
```

---

# Success

Display:

```text
Email Queued
```

User is redirected to:

```text
Thread View
```

The UI does not wait for SendGrid delivery.

---

# API Flow

---

# Send Draft

Endpoint:

```http
POST /drafts/:id/send
```

---

# Flow

1. Resolve authenticated user
2. Resolve workspace
3. Find draft
4. Ensure ownership
5. Validate draft
6. Resolve contact
7. Resolve sender
8. Resolve thread
9. Create thread if missing
10. Create outbound message
11. Update thread lastMessageAt
12. Update thread status
13. Create queue job
14. Mark draft sent
15. Return success

---

# Validation Rules

Before sending:

```text
Subject Required
Body Required
Contact Required
Sender Required
```

---

# Thread Resolution

If draft contains:

```text
threadId
```

Use existing thread.

Otherwise:

```text
Find Existing Thread
```

Using:

```text
workspaceId
contactId
senderId
```

If not found:

```text
Create Thread
```

Initial status:

```text
waiting_reply
```

---

# Message Creation

Create:

```text
Outbound Message
```

Direction:

```text
outbound
```

Initial status:

```text
queued
```

---

# Queue Flow

---

# Queue Purpose

The queue decouples:

```text
HTTP Request
```

from:

```text
Email Delivery
```

Users receive immediate responses.

Email delivery happens asynchronously.

---

# Queue Name

```text
email
```

---

# Job Name

```text
send-email
```

---

# Job Payload

```ts
type SendEmailJob = {
  workspaceId: string;
  messageId: string;
};
```

---

# Queue Flow

```text
API
    ↓
Create Job
    ↓
Redis
    ↓
BullMQ
    ↓
Worker
```

---

# Worker Flow

---

# Worker Purpose

The worker processes queued email jobs.

The worker owns:

```text
Email Delivery
Provider Execution
Message State Updates
```

---

# Process Send Email

Job:

```text
send-email
```

Payload:

```text
workspaceId
messageId
```

---

# Worker Processing Flow

1. Resolve message
2. Resolve thread
3. Resolve sender
4. Resolve contact
5. Build provider payload
6. Call email provider
7. Receive provider response
8. Update message
9. Complete job

---

# Provider Payload

Worker creates:

```text
SendEmailInput
```

Using:

```text
Sender
Contact
Message
```

---

# Provider Execution

Worker calls:

```ts
emailProvider.send()
```

The worker never calls:

```ts
sendgrid.send()
```

directly.

---

# Successful Delivery Flow

```text
Worker
    ↓
emailProvider.send()
    ↓
SendGrid
    ↓
Success Response
    ↓
providerMessageId
    ↓
Message Updated
```

---

# Message Update Flow

Store:

```text
providerMessageId
```

Update:

```text
status
sentAt
```

Status becomes:

```text
sent
```

---

# Failure Flow

```text
Worker
    ↓
Provider Failure
    ↓
Message Updated
    ↓
failed
```

Store:

```text
error
```

if available.

---

# Message State Lifecycle

Initial:

```text
queued
```

Success:

```text
queued
    ↓
sent
```

Failure:

```text
queued
    ↓
failed
```

---

# Redis Flow

Redis stores:

```text
BullMQ Jobs
Job State
Retries
Locks
```

Redis does not store:

```text
Messages
Threads
Drafts
Contacts
```

Persistent application data remains in PostgreSQL.

---

# Logging

Every layer uses structured logging.

Example:

```ts
logger.info({
  workspaceId,
  threadId,
  messageId,
});
```

Never:

```ts
logger.info(`Email sent`);
```

---

# Ownership Rules

Every draft belongs to exactly one workspace.

Every thread belongs to exactly one workspace.

Every message belongs to exactly one workspace.

Workers must only process records belonging to the originating workspace.

---

# Invariants

1. All outbound emails originate from a draft.
2. Every outbound email creates a message.
3. Every message belongs to exactly one thread.
4. Every message belongs to exactly one workspace.
5. Every thread belongs to exactly one workspace.
6. Email delivery always occurs through BullMQ.
7. API requests never call SendGrid directly.
8. Worker code never calls SendGrid directly.
9. Application code accesses email providers only through packages/email.
10. SendGrid implementation is isolated inside packages/email.
11. Every queued email creates exactly one send-email job.
12. Successful delivery stores providerMessageId.
13. Successful delivery updates message status to sent.
14. Failed delivery updates message status to failed.
15. Thread status represents conversation state.
16. Message status represents email delivery state.
17. Redis is used only for queue infrastructure.
18. PostgreSQL remains the source of truth for application data.
19. Queue jobs must be idempotent.
20. Worker execution must be safe for retries and duplicate processing.
