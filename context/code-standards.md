# Code Standards

# TypeScript

## Required

* `strict: true`
* No `any`
* Prefer type inference where obvious
* Prefer string literal unions over enums

Example:

```ts
export const THREAD_STATUSES = [
  'waiting_reply',
  'needs_action',
  'closed',
] as const;

export type ThreadStatus =
  (typeof THREAD_STATUSES)[number];
```

---

# Naming

## Files

Use:

```text
create-thread.ts
thread-service.ts
message-repository.ts
```

Convention:

```text
kebab-case
```

---

## Variables

Use:

```ts
threadId
workspaceId
lastMessageAt
```

Convention:

```text
camelCase
```

---

## Types

Use:

```ts
Thread
Message
CreateThreadInput
```

Convention:

```text
PascalCase
```

---

## Constants

Use:

```ts
DEFAULT_PAGE_SIZE
MAX_RETRY_COUNT
```

Convention:

```text
UPPER_SNAKE_CASE
```

---

# Backend

## Controllers

Allowed:

* request validation
* authentication
* service calls
* response mapping

Not allowed:

* business logic
* database queries

---

## Services

Contains:

* business rules
* orchestration
* transaction boundaries

---

## Repositories

Contains:

* selects
* inserts
* updates
* deletes

No business rules.

---

## Module Boundaries

Cross-module access goes through services.

Bad:

```text
threads -> messages repository
```

Good:

```text
threads -> messages service
```

---

# API

## Resource Naming

Use:

```text
/contacts
/threads
/messages
/senders
```

Avoid:

```text
/create-contact
/send-email
```

---

## Validation

Validate:

* body
* params
* query

before service execution.

---

# Frontend

## TanStack Query

Used for:

```text
contacts
threads
messages
settings
```

Server state only.

---

## Zustand

Used for:

```text
modals
drawers
filters
temporary UI state
```

Do not duplicate TanStack Query data.

---

## Components

Maximum responsibility:

```text
render UI
handle interaction
```

Data fetching belongs in hooks.

---

# Realtime

Event names:

```text
message.sent
message.delivered
message.opened
reply.received
thread.updated
```

Format:

```text
noun.event
```

---

# Queues

Every BullMQ job must:

* be idempotent
* support retries
* support duplicate execution

Job names:

```text
send-email
process-reply
process-tracking-event
generate-follow-up
```

---

# Providers

Application code accesses providers through abstractions.

Allowed:

```ts
emailProvider.send()
aiProvider.generate()
```

Not allowed outside integration layer:

```ts
sendgrid.send()
openai.responses.create()
```

---

# Logging

Format:

```ts
logger.info({
  workspaceId,
  threadId,
  messageId,
});
```

Avoid:

```ts
logger.info(
  `Thread ${threadId} updated`
);
```

---

# Monorepo

## Shared

```text
packages/shared
```

Contains:

```text
domain
types
constants
schemas
```

---

## Database

```text
packages/db
```

Contains:

```text
schema
migrations
queries
```

No business logic.

---

## Apps

```text
apps/api
apps/web
apps/worker
```

Application-specific code only.

---

# Architecture Constraints

Thread owns:

```text
primaryContactId
senderId
status
```

Message owns:

```text
threadId
direction
status
providerMessageId
```

Sender is selected when thread starts.

Future outbound messages use the same sender unless explicitly changed.

Thread is the source of conversation state.

Message is the source of email state.

Do not mix them.
