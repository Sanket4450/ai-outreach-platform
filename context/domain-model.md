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
│ firstName                       │
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
│ createdAt     Required          │
│ updatedAt     Required          │
│                                 │
│ Unique (workspaceId, userId)    │
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
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            drafts               │
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
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            drafts               │
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
│ contactId       FK, Required      │
│ senderId        FK, Required      │
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
└─────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│            drafts               │
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
│ threadId           FK, Required    │
│ providerMessageId  Unique          │
│ direction          Required        │
│                    (MESSAGE_       │
│                     DIRECTIONS)    │
│ status             Required        │
│ subject            Required        │
│ body               Required        │
│ scheduledFor                       │
│ sentAt                             │
│ deliveredAt                        │
│ bouncedAt                          │
│ firstOpenedAt                      │
│ firstClickedAt                     │
│ createdAt          Required        │
│ updatedAt          Required        │
└────────────────────────────────────┘
       │
       │ 1───* (has many)
       ▼
┌─────────────────────────────────┐
│        webhook_events           │
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
│ threadId      FK (nullable)       │
│ senderId      FK, Required        │
│ contactId     FK, Required        │
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
│ messageId     FK, Required        │
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

## Enum Values

| Enum | Values |
|------|--------|
| THREAD_STATUSES | `waiting_reply`, `needs_action`, `closed` |
| MESSAGE_DIRECTIONS | `inbound`, `outbound` |
| MESSAGE_STATUSES | `scheduled`, `queued`, `sent`, `failed` |
| DRAFT_STATUSES | `generated`, `edited`, `sent`, `discarded` |
| SENDER_PROVIDERS | `sendgrid` |
| WEBHOOK_EVENT_TYPES | `delivered`, `bounced`, `opened`, `clicked`, `spam_reported` |

---

## Relationships Summary

| From | To | Type |
|------|----|------|
| users | workspace_members | 1 → * |
| workspaces | workspace_members | 1 → * |
| workspaces | contacts | 1 → * |
| workspaces | senders | 1 → * |
| workspaces | threads | 1 → * |
| workspaces | messages | 1 → * |
| workspaces | drafts | 1 → * |
| workspaces | webhook_events | 1 → * |
| workspace_members | users | * → 1 |
| workspace_members | workspaces | * → 1 |
| contacts | threads | 1 → * |
| contacts | drafts | 1 → * |
| senders | threads | 1 → * |
| senders | drafts | 1 → * |
| threads | messages | 1 → * |
| threads | drafts | 1 → * |
| messages | webhook_events | 1 → * |

---

## Indexes

| Table | Index Name | Columns |
|-------|-----------|---------|
| contacts | contacts_workspace_id_idx | workspaceId |
| contacts | contacts_workspace_id_email_uq | workspaceId, email (Unique) |
| senders | senders_workspace_id_idx | workspaceId |
| senders | senders_workspace_id_provider_email_uq | workspaceId, provider, email (Unique) |
| threads | threads_workspace_id_last_message_at_idx | workspaceId, lastMessageAt |
| threads | threads_workspace_id_status_idx | workspaceId, status |
| messages | messages_thread_id_created_at_idx | threadId, createdAt |
| messages | messages_status_idx | status |
| messages | messages_status_scheduled_for_idx | status, scheduledFor |
| workspace_members | workspace_members_workspace_id_idx | workspaceId |
| workspace_members | workspace_members_user_id_idx | userId |
| workspace_members | workspace_members_workspace_id_user_id_uq | workspaceId, userId (Unique) |
| webhook_events | webhook_events_message_id_idx | messageId |
| webhook_events | webhook_events_workspace_id_idx | workspaceId |
| webhook_events | webhook_events_message_id_occurred_at_idx | messageId, occurredAt |