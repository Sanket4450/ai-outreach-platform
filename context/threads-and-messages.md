# Threads & Messages Flow

## Purpose

This document defines the complete end-to-end flow for:

* Thread creation
* Thread retrieval
* Thread state management
* Message creation
* Message retrieval
* Conversation history
* Inbound communication
* Outbound communication

This document is the source of truth for:

* Backend implementation
* Frontend implementation
* API design
* Conversation lifecycle management

---

# General Flow

The platform is built around conversations.

A conversation is represented by a thread.

A thread represents communication between:

```text
Sender
    ↔
Contact
```

A thread contains all messages exchanged between those participants.

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
email state
```

Examples:

```text
queued
sent
failed
```

A thread contains many messages.

A message belongs to exactly one thread.

---

# Conversation Lifecycle

```text
Contact
    ↓
Draft Created
    ↓
Message Created
    ↓
Thread Created
    ↓
Outbound Sent
    ↓
Waiting Reply
    ↓
Inbound Reply
    ↓
Needs Action
    ↓
User Responds
    ↓
Waiting Reply
    ↓
Conversation Closed
```

---

# Thread Flow

---

# Thread Client Flow

---

# Threads List

## UI

Display:

```text
Inbox
```

Columns:

```text
Contact
Sender
Status
Last Activity
```

Actions:

```text
Open Thread
Close Thread
Reopen Thread
```

---

## Request

```http
GET /threads
```

---

## Success

Display thread list.

Sort:

```text
lastMessageAt DESC
```

---

# Filter Threads

User may filter by:

```text
waiting_reply
needs_action
closed
```

Request:

```http
GET /threads?status=needs_action
```

---

# Open Thread

User selects:

```text
Open Thread
```

Request:

```http
GET /threads/:id
```

---

## Success

Display:

```text
Thread Details
Conversation Timeline
```

---

# Close Thread

Request:

```http
POST /threads/:id/close
```

---

## Success

Thread status becomes:

```text
closed
```

---

# Reopen Thread

Request:

```http
POST /threads/:id/reopen
```

---

## Success

Thread status becomes:

```text
needs_action
```

---

# Thread API Flow

---

# List Threads

Endpoint:

```http
GET /threads
```

Flow:

1. Resolve authenticated user
2. Resolve active workspace
3. Apply filters
4. Sort by lastMessageAt DESC
5. Return paginated results

---

# Get Thread

Endpoint:

```http
GET /threads/:id
```

Flow:

1. Resolve workspace
2. Find thread
3. Ensure ownership
4. Return thread

---

# Create Thread

Threads are normally created internally.

External users do not manually create threads.

Internal Flow:

1. Resolve workspace
2. Resolve contact
3. Resolve sender
4. Find existing thread
5. If found return existing thread
6. Otherwise create thread
7. Set status
8. Return thread

Initial status:

```text
waiting_reply
```

---

# Close Thread

Endpoint:

```http
POST /threads/:id/close
```

Flow:

1. Resolve workspace
2. Find thread
3. Ensure ownership
4. Set status
5. Update thread
6. Return success

---

# Reopen Thread

Endpoint:

```http
POST /threads/:id/reopen
```

Flow:

1. Resolve workspace
2. Find thread
3. Ensure ownership
4. Set status
5. Update thread
6. Return success

---

# Thread Status Lifecycle

```text
waiting_reply
    ↓ inbound reply

needs_action
    ↓ close

closed
```

Optional future transition:

```text
closed
    ↓ reopen

needs_action
```

---

# Message Flow

---

# Message Client Flow

---

# Message Timeline

Messages are displayed inside a thread.

Display:

```text
Conversation Timeline
```

Each item displays:

```text
Direction
Subject
Body
Status
Created At
```

---

# Load Messages

Request:

```http
GET /messages?threadId=:threadId
```

Example:

```http
GET /messages?threadId=thread_123
```

---

## Success

Display chronological message history.

Example:

```text
Outbound Message
Inbound Reply
Outbound Follow Up
Inbound Reply
```

---

# View Message

Request:

```http
GET /messages/:id
```

---

## Success

Display message details.

---

# Message API Flow

---

# List Messages

Endpoint:

```http
GET /messages
```

Query Parameters:

```text
threadId
```

Example:

```http
GET /messages?threadId=thread_123
```

Flow:

1. Resolve workspace
2. Validate threadId
3. Ensure thread ownership
4. Fetch messages
5. Sort by createdAt ASC
6. Return paginated results

---

# Get Message

Endpoint:

```http
GET /messages/:id
```

Flow:

1. Resolve workspace
2. Find message
3. Ensure ownership
4. Return message

---

# Create Outbound Message

Messages are normally created from:

```text
Draft Send Flow
```

Endpoint:

```http
POST /messages
```

Request:

```json
{
  "threadId": "thread_123",
  "subject": "Hello",
  "body": "Hi there"
}
```

Flow:

1. Resolve workspace
2. Resolve thread
3. Ensure ownership
4. Create message
5. Set direction
6. Set status
7. Update thread lastMessageAt
8. Return message

Direction:

```text
outbound
```

Initial status:

```text
queued
```

---

# Create Inbound Message

Messages are normally created internally.

Source:

```text
Webhook Processing
```

Endpoint:

```http
POST /messages
```

Internal Flow:

1. Resolve thread
2. Create message
3. Set direction
4. Update thread status
5. Update thread lastMessageAt
6. Return message

Direction:

```text
inbound
```

Thread status becomes:

```text
needs_action
```

---

# Mark Message Sent

Endpoint:

```http
POST /messages/:id/mark-sent
```

Flow:

1. Resolve message
2. Update status
3. Store sentAt
4. Return success

Status:

```text
sent
```

---

# Mark Message Delivered

Endpoint:

```http
POST /messages/:id/mark-delivered
```

Flow:

1. Resolve message
2. Update deliveredAt
3. Return success

---

# Mark Message Opened

Endpoint:

```http
POST /messages/:id/mark-opened
```

Flow:

1. Resolve message
2. Update firstOpenedAt
3. Return success

---

# Mark Message Clicked

Endpoint:

```http
POST /messages/:id/mark-clicked
```

Flow:

1. Resolve message
2. Update firstClickedAt
3. Return success

---

# Mark Message Bounced

Endpoint:

```http
POST /messages/:id/mark-bounced
```

Flow:

1. Resolve message
2. Update bouncedAt
3. Set status
4. Return success

Status:

```text
failed
```

---

# Message Status Lifecycle

```text
scheduled
    ↓

queued
    ↓

sent
```

Failure path:

```text
queued
    ↓

failed
```

Tracking events:

```text
sent
    ↓ delivered
    ↓ opened
    ↓ clicked
```

---

# Thread & Message Interaction Flow

Thread and message modules collaborate.

Example:

```text
Create Message
    ↓
Message Saved
    ↓
Thread Updated
    ↓
lastMessageAt Updated
```

Inbound reply flow:

```text
Inbound Message
    ↓
Message Created
    ↓
Thread Status Updated
    ↓
needs_action
```

---

# Ownership Rules

Every thread belongs to exactly one workspace.

Every message belongs to exactly one workspace.

Workspace members can:

* View threads
* View messages
* Create messages
* Close threads
* Reopen threads

Threads and messages are never shared across workspaces.

---

# Invariants

1. Every thread belongs to exactly one workspace.
2. Every message belongs to exactly one workspace.
3. Every message belongs to exactly one thread.
4. A thread is associated with exactly one contact.
5. A thread is associated with exactly one sender.
6. Messages cannot exist without a thread.
7. Messages must be ordered chronologically.
8. Thread ownership is determined by workspaceId.
9. Message ownership is determined by workspaceId.
10. lastMessageAt must always reflect the latest message in the thread.
11. Inbound replies move a thread to needs_action.
12. Closing a thread does not delete messages.
13. Threads cannot access messages from another workspace.
14. Message status represents email delivery state.
15. Thread status represents conversation state.
16. A sender is selected when a thread is created.
17. Future outbound messages normally continue using the same sender.
