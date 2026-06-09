# Domain Model

## Entity-Relationship Diagrams

---

### Users

```
┌─────────────────────────────────┐
│             users               │
├─────────────────────────────────┤
│ id            PK                │
│ email         Unique, Required  │
│ passwordHash  Required          │
│ firstName     Required          │
│ lastName                        │
│ isEmailVerified  Required       │
│                Default false    │
│ deletedAt     (soft delete)     │
│ createdAt     Required          │
│ updatedAt     Required          │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│       workspace_members         │
├─────────────────────────────────┤
│ id            PK                │
│ workspaceId   FK, Required      │
│ userId        FK, Required      │
│ role          Required          │
│               (WORKSPACE_ROLES) │
│ createdAt     Required          │
│ updatedAt     Required          │
│                                 │
│ Unique (workspaceId, userId)    │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│     workspace_invitations       │
│     (as createdBy → FK)         │
└─────────────────────────────────┘
```

---

### Workspaces

```
┌─────────────────────────────────┐
│           workspaces            │
├─────────────────────────────────┤
│ id            PK                │
│ name          Required          │
│ createdAt     Required          │
│ updatedAt     Required          │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│       workspace_members         │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│     workspace_invitations       │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            contacts             │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            senders              │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            threads              │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│           messages              │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            drafts               │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│        webhook_events           │
└─────────────────────────────────┘
```

---

### Contacts

```
┌───────────────────────────────────┐
│             contacts              │
├───────────────────────────────────┤
│ id            PK                  │
│ workspaceId   FK, Required        │
│               ON DELETE CASCADE   │
│ email         Required            │
│ firstName                         │
│ lastName                          │
│ company                           │
│ title                             │
│ linkedinUrl                       │
│ notes                             │
│ deletedAt     (soft delete)       │
│ createdAt     Required            │
│ updatedAt     Required            │
│                                   │
│ Unique (workspaceId, email)       │
└───────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            threads              │
│     ON DELETE RESTRICT          │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            drafts               │
│     ON DELETE CASCADE           │
└─────────────────────────────────┘
```

---

### Senders

```
┌──────────────────────────────────┐
│             senders              │
├──────────────────────────────────┤
│ id              PK               │
│ workspaceId     FK, Required     │
│                 ON DELETE CASCADE│
│ name            Required         │
│ email           Required         │
│ provider        Required         │
│ providerConfig  (JSONB)          │
│ createdAt       Required         │
│ updatedAt       Required         │
│                                  │
│ Unique (workspaceId, provider,   │
│         email)                   │
└──────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            threads              │
│     ON DELETE RESTRICT          │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            drafts               │
│     ON DELETE RESTRICT          │
└─────────────────────────────────┘
```

---

### Threads

```
┌───────────────────────────────────┐
│              threads              │
├───────────────────────────────────┤
│ id              PK                │
│ workspaceId     FK, Required      │
│                 ON DELETE CASCADE │
│ contactId       FK, Required      │
│                 ON DELETE RESTRICT│
│ senderId        FK, Required      │
│                 ON DELETE RESTRICT│
│ status          Required          │
│                 (THREAD_STATUSES) │
│ lastMessageAt                     │
│ createdAt       Required          │
│ updatedAt       Required          │
└───────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│           messages              │
│     ON DELETE CASCADE           │
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            drafts               │
│     ON DELETE SET NULL          │
│     (threadId becomes null)     │
└─────────────────────────────────┘
```

---

### Messages

```
┌────────────────────────────────────┐
│              messages              │
├────────────────────────────────────┤
│ id                 PK              │
│ workspaceId        FK, Required    │
│                    ON DELETE CASCADE│
│ threadId           FK, Required    │
│                    ON DELETE CASCADE│
│ providerMessageId  Unique          │
│ direction          Required        │
│                    (MESSAGE_       │
│                     DIRECTIONS)    │
│ status             Required        │
│ fromEmail          Required        │
│ toEmail            Required        │
│ fromName                           │
│ toName                             │
│ subject            Required        │
│ body               Required        │
│ scheduledFor                       │
│ sentAt                             │
│ deliveredAt                        │
│ bouncedAt                          │
│ firstOpenedAt                      │
│ firstClickedAt                     │
│ deletedAt          (soft delete)   │
│ createdAt          Required        │
│ updatedAt          Required        │
└────────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│        webhook_events           │
│     ON DELETE CASCADE           │
└─────────────────────────────────┘
```

---

### Drafts

```
┌───────────────────────────────────┐
│              drafts               │
├───────────────────────────────────┤
│ id            PK                  │
│ workspaceId   FK, Required        │
│               ON DELETE CASCADE   │
│ threadId      FK (nullable)       │
│               ON DELETE SET NULL  │
│ senderId      FK (nullable)       │
│               ON DELETE RESTRICT  │
│ contactId     FK (nullable)       │
│               ON DELETE CASCADE   │
│ subject       Required            │
│               Default ''          │
│ body          Required            │
│               Default ''          │
│ createdAt     Required            │
│ updatedAt     Required            │
└───────────────────────────────────┘
```

---

### Webhook Events

```
┌───────────────────────────────────┐
│          webhook_events           │
├───────────────────────────────────┤
│ id            PK                  │
│ workspaceId   FK, Required        │
│               ON DELETE CASCADE   │
│ messageId     FK, Required        │
│               ON DELETE CASCADE   │
│ provider      Required            │
│ eventType     Required            │
│               (WEBHOOK_EVENT_     │
│                TYPES)             │
│ payload       Required (JSONB)    │
│ occurredAt    Required            │
│ createdAt     Required            │
│ updatedAt     Required            │
└───────────────────────────────────┘
```

---

### Email Verifications

```
┌───────────────────────────────────┐
│       email_verifications         │
├───────────────────────────────────┤
│ id            PK                  │
│ email         Required            │
│ otp           Required            │
│ expiresAt     Required            │
│ createdAt     Required            │
│ updatedAt     Required            │
└───────────────────────────────────┘
```

> **Note:** This table is standalone with no foreign key relationships to other entities. Rows are typically short-lived and cleaned up after verification or expiry.

---

### Workspace Invitations

```
┌───────────────────────────────────┐
│      workspace_invitations        │
├───────────────────────────────────┤
│ id            PK                  │
│ workspaceId   FK, Required        │
│               ON DELETE CASCADE   │
│ email         Required            │
│ token         Unique, Required    │
│ expiresAt     Required            │
│ acceptedAt                        │
│ createdBy     FK, Required        │
│               (users.id)          │
│               ON DELETE RESTRICT  │
│ createdAt     Required            │
│ updatedAt     Required            │
└───────────────────────────────────┘
       │
       │ *───1 (belongs to)
       ▼
┌─────────────────────────────────┐
│           workspaces            │
└─────────────────────────────────┘
       │
       │ *───1 (belongs to)
       ▼
┌─────────────────────────────────┐
│             users               │
│     (via createdBy FK)          │
└─────────────────────────────────┘
```

---

## Enum Values

| Enum                | Values                                                       |
| ------------------- | ------------------------------------------------------------ |
| WORKSPACE_ROLES     | `owner`, `member`                                            |
| THREAD_STATUSES     | `waiting_reply`, `needs_action`, `closed`                    |
| MESSAGE_DIRECTIONS  | `inbound`, `outbound`                                        |
| MESSAGE_STATUSES    | `scheduled`, `queued`, `sent`, `failed`                      |
| DRAFT_STATUSES      | `generated`, `edited`, `sent`, `discarded`                   |
| SENDER_PROVIDERS    | `sendgrid`                                                   |
| WEBHOOK_EVENT_TYPES | `delivered`, `bounced`, `opened`, `clicked`, `spam_reported` |

---

## Relationships Summary

| From                  | To                   | Type   | ON DELETE                    |
| --------------------- | -------------------- | ------ | ---------------------------- |
| users                 | workspace_members    | 1 → \* | CASCADE (via userId FK)      |
| users                 | workspace_invitations| 1 → \* | RESTRICT (via createdBy FK)  |
| workspaces            | workspace_members    | 1 → \* | CASCADE                      |
| workspaces            | workspace_invitations| 1 → \* | CASCADE                      |
| workspaces            | contacts             | 1 → \* | CASCADE                      |
| workspaces            | senders              | 1 → \* | CASCADE                      |
| workspaces            | threads              | 1 → \* | CASCADE                      |
| workspaces            | messages             | 1 → \* | CASCADE                      |
| workspaces            | drafts               | 1 → \* | CASCADE                      |
| workspaces            | webhook_events       | 1 → \* | CASCADE                      |
| workspace_members     | users                | \* → 1 | —                            |
| workspace_members     | workspaces           | \* → 1 | —                            |
| workspace_invitations | workspaces           | \* → 1 | —                            |
| workspace_invitations | users                | \* → 1 | —                            |
| contacts              | threads              | 1 → \* | RESTRICT                     |
| contacts              | drafts               | 1 → \* | CASCADE                      |
| senders               | threads              | 1 → \* | RESTRICT                     |
| senders               | drafts               | 1 → \* | RESTRICT                     |
| threads               | messages             | 1 → \* | CASCADE                      |
| threads               | drafts               | 1 → \* | SET NULL                     |
| messages              | webhook_events       | 1 → \* | CASCADE                      |

---

## Indexes

| Table                 | Index Name                                      | Columns                               |
| --------------------- | ----------------------------------------------- | ------------------------------------- |
| contacts              | contacts_workspace_id_idx                       | workspaceId                           |
| contacts              | contacts_workspace_id_email_uq                  | workspaceId, email (Unique)           |
| messages              | messages_thread_id_created_at_idx               | threadId, createdAt                   |
| messages              | messages_status_idx                             | status                                |
| messages              | messages_status_scheduled_for_idx               | status, scheduledFor                  |
| senders               | senders_workspace_id_idx                        | workspaceId                           |
| senders               | senders_workspace_id_provider_email_uq          | workspaceId, provider, email (Unique) |
| threads               | threads_workspace_id_last_message_at_idx        | workspaceId, lastMessageAt            |
| threads               | threads_workspace_id_status_idx                 | workspaceId, status                   |
| webhook_events        | webhook_events_message_id_idx                   | messageId                             |
| webhook_events        | webhook_events_workspace_id_idx                 | workspaceId                           |
| webhook_events        | webhook_events_message_id_occurred_at_idx       | messageId, occurredAt                 |
| workspace_invitations | workspace_invitations_workspace_id_email_idx    | workspaceId, email                    |
| workspace_members     | workspace_members_workspace_id_idx              | workspaceId                           |
| workspace_members     | workspace_members_user_id_idx                   | userId                                |
| workspace_members     | workspace_members_workspace_id_user_id_uq       | workspaceId, userId (Unique)          |