# Contact Management Flow

## Purpose

This document defines the complete end-to-end flow for:

- Contact creation
- Contact updates
- Contact deletion
- Contact listing
- Contact retrieval

This document is the source of truth for:

- Backend implementation
- Frontend implementation
- API design
- Workspace data isolation

---

# General Flow

A contact represents a recipient that can participate in outreach conversations.

A contact belongs to exactly one workspace.

A contact may later be associated with:

- Drafts
- Threads
- Messages

Contacts are created before outreach begins and serve as the primary recipient record within the system.

---

# Client Flow

---

# Contacts List

## UI

Display:

```text
Contacts Table
```

Columns:

```text
Name
Email
Company
Title
Created At
```

Actions:

```text
Create Contact
Edit Contact
Delete Contact
View Contact
```

---

# Create Contact

## UI

Fields:

```text
First Name
Last Name
Email
Company
Title
LinkedIn URL
Notes
```

Actions:

```text
Create Contact
```

---

## Request

```http
POST /contacts
```

Request:

```json
{
  "email": "john@acme.com",
  "firstName": "John",
  "lastName": "Smith",
  "company": "Acme",
  "title": "Founder",
  "linkedinUrl": "https://linkedin.com/in/john",
  "notes": "Met at conference"
}
```

---

## Success

Contact created.

Client:

```text
Refresh Contacts List
```

---

# View Contact

Request:

```http
GET /contacts/:id
```

---

## Success

Display:

```text
Contact Details
```

Including:

```text
Profile Information
Future Thread History
Future Draft History
```

---

# Edit Contact

Request:

```http
PATCH /contacts/:id
```

---

## Success

Contact updated.

Client refreshes contact details.

---

# Delete Contact

User selects:

```text
Delete Contact
```

Confirmation required.

---

## Request

```http
DELETE /contacts/:id
```

---

## Success

Contact removed from active views.

Deletion is implemented as:

```text
Soft Delete
```

---

# Search Contacts

User enters:

```text
Name
Email
Company
```

Client sends query parameters.

Request:

```http
GET /contacts?search=john
```

---

## Success

Filtered contacts returned.

---

# API Flow

---

# Create Contact

Endpoint:

```http
POST /contacts
```

Flow:

1. Resolve authenticated user
2. Resolve active workspace
3. Validate payload
4. Ensure email unique within workspace
5. Create contact
6. Return contact

---

# Get Contact

Endpoint:

```http
GET /contacts/:id
```

Flow:

1. Resolve workspace
2. Find contact
3. Ensure contact belongs to workspace
4. Ensure contact not deleted
5. Return contact

---

# List Contacts

Endpoint:

```http
GET /contacts
```

Flow:

1. Resolve workspace
2. Apply search filters
3. Exclude deleted contacts
4. Return paginated results

---

# Update Contact

Endpoint:

```http
PATCH /contacts/:id
```

Flow:

1. Resolve workspace
2. Find contact
3. Ensure ownership
4. Validate update payload
5. Persist changes
6. Return contact

---

# Delete Contact

Endpoint:

```http
DELETE /contacts/:id
```

Flow:

1. Resolve workspace
2. Find contact
3. Ensure ownership
4. Set deletedAt
5. Return success

---

# Ownership Rules

Every contact belongs to exactly one workspace.

Workspace members can:

- Create contacts
- View contacts
- Update contacts
- Delete contacts

Contacts are never shared across workspaces.

---

# Invariants

1. Every contact belongs to exactly one workspace.
2. Contact email must be unique within a workspace.
3. Deleted contacts are excluded from normal queries.
4. Workspace members cannot access contacts from another workspace.
5. Contact deletion is implemented using soft delete.
6. A contact may participate in multiple threads.
7. A contact may have multiple drafts associated with it.
8. Contact ownership is determined by workspaceId.
