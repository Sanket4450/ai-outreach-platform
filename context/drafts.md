# Drafts Flow

## Purpose

This document defines the complete end-to-end flow for:

- Draft creation
- Draft retrieval
- Draft updates
- Draft deletion
- Draft composition
- Draft lifecycle management
- Draft sending
- Thread and message creation from drafts

This document is the source of truth for:

- Backend implementation
- Frontend implementation
- API design
- Email composition workflow

---

# General Flow

A draft represents an email being composed by a user.

A draft exists before a conversation begins.

A draft may optionally be associated with:

```text
Contact
Sender
Thread
```

A draft can be progressively completed over time.

Example:

```text
Create Draft
    ↓
Write Subject
    ↓
Write Body
    ↓
Select Contact
    ↓
Select Sender
    ↓
Send Draft
```

A draft becomes a message only when it is sent.

---

# Draft Responsibility

A draft owns:

```text
threadId (nullable)
senderId (nullable)
contactId (nullable)

subject
body
status
```

A draft represents:

```text
editable email content
```

A draft is not part of a conversation until it is sent.

---

# Draft Status Lifecycle

```text
generated
    ↓ edit

edited
    ↓ send

sent
```

Discard flow:

```text
generated
    ↓

discarded
```

```text
edited
    ↓

discarded
```

---

# Draft Composition Lifecycle

New Draft:

```text
Draft Created
    ↓
No Contact
    ↓
No Sender
    ↓
No Thread
```

Draft In Progress:

```text
Draft Created
    ↓
Subject Added
    ↓
Body Added
    ↓
Contact Selected
    ↓
Sender Selected
```

Ready To Send:

```text
Subject Present
    ↓
Body Present
    ↓
Contact Selected
    ↓
Sender Selected
```

---

# Draft Flow

---

# Draft Client Flow

---

# Drafts List

## UI

Display:

```text
Drafts
```

Columns:

```text
Subject
Contact
Sender
Status
Updated At
```

Actions:

```text
Create Draft
Edit Draft
Delete Draft
Send Draft
View Draft
```

---

## Request

```http
GET /drafts
```

---

## Success

Display draft list.

Sort:

```text
updatedAt DESC
```

---

# Filter Drafts

User may filter by:

```text
generated
edited
sent
discarded
```

Request:

```http
GET /drafts?status=edited
```

---

## Success

Filtered drafts returned.

---

# Create Draft

Users may create empty drafts.

Request:

```http
POST /drafts
```

Request:

```json
{}
```

---

## Success

Draft created.

Initial state:

```text
contactId = null
senderId = null
threadId = null

subject = ''
body = ''
```

Status:

```text
generated
```

---

# Open Draft

Request:

```http
GET /drafts/:id
```

---

## Success

Display:

```text
Draft Editor
```

Fields:

```text
Subject
Body
Contact
Sender
```

---

# Edit Draft

User may update:

```text
subject
body
contactId
senderId
```

Request:

```http
PATCH /drafts/:id
```

Example:

```json
{
  "subject": "Quick Question",
  "body": "Hi John...",
  "contactId": "contact_123",
  "senderId": "sender_123"
}
```

---

## Success

Draft updated.

Status becomes:

```text
edited
```

---

# Delete Draft

Request:

```http
DELETE /drafts/:id
```

---

## Success

Draft status becomes:

```text
discarded
```

Draft no longer appears in default views.

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

## Validation

Before sending:

```text
subject must exist
body must exist
contactId must exist
senderId must exist
```

If any are missing:

```text
Draft Cannot Be Sent
```

---

## Success

Draft status becomes:

```text
sent
```

User is redirected to:

```text
Conversation Thread
```

---

# Draft API Flow

---

# Create Draft

Endpoint:

```http
POST /drafts
```

Flow:

1. Resolve authenticated user
2. Resolve workspace
3. Create draft
4. Set empty values
5. Set status
6. Return draft

Initial status:

```text
generated
```

---

# List Drafts

Endpoint:

```http
GET /drafts
```

Flow:

1. Resolve workspace
2. Apply filters
3. Sort by updatedAt DESC
4. Return paginated results

---

# Get Draft

Endpoint:

```http
GET /drafts/:id
```

Flow:

1. Resolve workspace
2. Find draft
3. Ensure ownership
4. Return draft

---

# Update Draft

Endpoint:

```http
PATCH /drafts/:id
```

Flow:

1. Resolve workspace
2. Find draft
3. Ensure ownership
4. Validate payload
5. Update draft
6. Set status
7. Return draft

Status:

```text
edited
```

---

# Delete Draft

Endpoint:

```http
DELETE /drafts/:id
```

Flow:

1. Resolve workspace
2. Find draft
3. Ensure ownership
4. Mark discarded
5. Return success

Status:

```text
discarded
```

---

# Send Draft

Endpoint:

```http
POST /drafts/:id/send
```

Flow:

1. Resolve workspace
2. Find draft
3. Ensure ownership
4. Validate subject
5. Validate body
6. Validate contactId
7. Validate senderId
8. Resolve contact
9. Resolve sender
10. Find existing thread
11. Create thread if missing
12. Create outbound message
13. Update thread lastMessageAt
14. Update thread status
15. Link draft to thread
16. Mark draft sent
17. Return success

Draft status:

```text
sent
```

Message direction:

```text
outbound
```

Message status:

```text
queued
```

Thread status:

```text
waiting_reply
```

---

# Draft & Thread Interaction Flow

Drafts interact with threads through services.

Example:

```text
Draft Sent
    ↓
Find Existing Thread
    ↓
Create Thread If Missing
    ↓
Attach Draft To Thread
    ↓
Create Message
```

---

# Draft & Message Interaction Flow

Drafts create messages.

Example:

```text
Draft
    ↓ send
Message Created
```

A draft never becomes a message record.

Instead:

```text
Draft
    ↓
Message Created
```

Both records continue to exist.

---

# Draft & Conversation Flow

New Conversation:

```text
Create Draft
    ↓
Select Contact
    ↓
Select Sender
    ↓
Send Draft
    ↓
Create Thread
    ↓
Create Message
```

Existing Conversation:

```text
Open Thread
    ↓
Create Draft
    ↓
threadId assigned
    ↓
Send Draft
    ↓
Create Message
    ↓
Update Thread
```

---

# Ownership Rules

Every draft belongs to exactly one workspace.

Workspace members can:

- Create drafts
- View drafts
- Update drafts
- Delete drafts
- Send drafts

Drafts are never shared across workspaces.

---

# Invariants

1. Every draft belongs to exactly one workspace.
2. A draft may have a null contactId.
3. A draft may have a null senderId.
4. A draft may have a null threadId.
5. A draft must have a subject before sending.
6. A draft must have a body before sending.
7. A draft must have a contact before sending.
8. A draft must have a sender before sending.
9. Draft ownership is determined by workspaceId.
10. Sending a draft creates a message.
11. Sending a draft may create a thread.
12. A sent draft cannot be edited.
13. A discarded draft cannot be sent.
14. Draft status represents composition state.
15. Message status represents delivery state.
16. Thread status represents conversation state.
17. Historical drafts remain available for auditing.
18. A draft linked to a thread must belong to the same workspace as that thread.
19. A draft linked to a contact must belong to the same workspace as that contact.
20. A draft linked to a sender must belong to the same workspace as that sender.
