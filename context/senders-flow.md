# Sender Management Flow

## Purpose

This document defines the complete end-to-end flow for:

- Sender creation
- Sender updates
- Sender deletion
- Sender listing
- Sender retrieval

This document is the source of truth for:

- Backend implementation
- Frontend implementation
- API design
- Sender ownership and usage

---

# General Flow

A sender represents an email identity capable of sending outbound emails.

Examples:

```text
john@company.com
sales@company.com
founder@startup.com
```

A sender belongs to exactly one workspace.

Senders are later used by:

- Drafts
- Threads
- Messages

A sender must exist before outbound communication can occur.

---

# Client Flow

---

# Sender List

## UI

Display:

```text
Sender Name
Sender Email
Provider
Created At
```

Actions:

```text
Add Sender
Edit Sender
Delete Sender
```

---

# Create Sender

## UI

Fields:

```text
Sender Name
Sender Email
Provider
Provider Configuration
```

Actions:

```text
Create Sender
```

---

## Request

```http
POST /senders
```

Request:

```json
{
  "name": "Sales Team",
  "email": "sales@company.com",
  "provider": "sendgrid",
  "providerConfig": {}
}
```

---

## Success

Sender created.

Client refreshes sender list.

---

# View Sender

Request:

```http
GET /senders/:id
```

---

## Success

Display sender details.

---

# Edit Sender

Request:

```http
PATCH /senders/:id
```

---

## Success

Sender updated.

---

# Delete Sender

User selects:

```text
Delete Sender
```

Confirmation required.

---

## Request

```http
DELETE /senders/:id
```

---

## Success

Sender removed.

---

# API Flow

---

# Create Sender

Endpoint:

```http
POST /senders
```

Flow:

1. Resolve authenticated user
2. Resolve workspace
3. Validate payload
4. Ensure unique sender email/provider combination
5. Create sender
6. Return sender

---

# Get Sender

Endpoint:

```http
GET /senders/:id
```

Flow:

1. Resolve workspace
2. Find sender
3. Ensure sender belongs to workspace
4. Return sender

---

# List Senders

Endpoint:

```http
GET /senders
```

Flow:

1. Resolve workspace
2. Fetch senders
3. Return paginated results

---

# Update Sender

Endpoint:

```http
PATCH /senders/:id
```

Flow:

1. Resolve workspace
2. Find sender
3. Validate payload
4. Persist changes
5. Return sender

---

# Delete Sender

Endpoint:

```http
DELETE /senders/:id
```

Flow:

1. Resolve workspace
2. Find sender
3. Ensure sender is not referenced by active threads
4. Delete sender
5. Return success

---

# Ownership Rules

Every sender belongs to exactly one workspace.

Workspace members can:

- Create senders
- View senders
- Update senders
- Delete senders

Senders are never shared across workspaces.

---

# Invariants

1. Every sender belongs to exactly one workspace.
2. Sender ownership is determined by workspaceId.
3. Sender email/provider combination must be unique within a workspace.
4. Workspace members cannot access senders from another workspace.
5. A sender may participate in multiple threads.
6. A sender may be referenced by multiple drafts.
7. Senders referenced by active threads cannot be deleted.
8. Future outbound messages should use the sender associated with the thread.
