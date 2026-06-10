# Code Standards

---

## Naming

### Files

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

### Variables

Use:

```ts
threadId;
workspaceId;
lastMessageAt;
```

Convention:

```text
camelCase
```

### Types

Use:

```ts
Thread;
Message;
CreateThreadInput;
```

Convention:

```text
PascalCase
```

### Constants

Use:

```ts
DEFAULT_PAGE_SIZE;
MAX_RETRY_COUNT;
```

Convention:

```text
UPPER_SNAKE_CASE
```

---

## TypeScript

### Required

- `strict: true`
- No `any`
- Prefer type inference where obvious
- Prefer string literal unions over enums

Example:

```ts
export const THREAD_STATUSES = ['waiting_reply', 'needs_action', 'closed'] as const;

export type ThreadStatus = (typeof THREAD_STATUSES)[number];
```

---

## Monorepo Structure

```
ai-outreach-platform/
├── apps/
│   ├── api/         # NestJS backend API server
│   ├── web/         # Next.js frontend application
│   └── worker/      # BullMQ background job processor
├── packages/
│   ├── shared/      # Domain types, enums, constants, and validation schemas
│   ├── db/          # Drizzle ORM schema, migrations, and query helpers
│   ├── ai/          # AI provider abstraction (LLM calls, prompt templates)
│   ├── email/       # Email provider abstraction (send, receive, track)
│   └── types/       # TypeScript utility types and type guards
├── infra/
│   ├── docker/      # Docker Compose configuration for local development
│   ├── nginx/       # Reverse proxy configuration
│   └── scripts/     # Infrastructure automation scripts
└── context/         # Project documentation (domain model, code standards, etc.)
```

### Package Responsibilities

#### `apps/api` — Backend API Server

- Exposes REST endpoints consumed by the web frontend
- Handles authentication, request validation, and response mapping
- Delegates all business logic to services in appropriate packages
- **Allowed:** controllers, guards, interceptors, middleware, config
- **Not allowed:** raw database queries, direct provider calls

#### `apps/web` — Frontend Application

- Next.js application with server-side rendering
- Renders UI and handles user interactions
- Fetches data via TanStack Query hooks (server state)
- Manages ephemeral UI state via Zustand (modals, drawers, filters)
- **Allowed:** page components, UI components, hooks, layout
- **Not allowed:** business logic, direct database access

#### `apps/worker` — Background Job Processor

- Processes BullMQ jobs (email sending, reply processing, tracking events, AI generation)
- Every job must be idempotent, retryable, and safe for duplicate execution
- **Allowed:** job handlers, queue definitions, worker bootstrap
- **Not allowed:** HTTP endpoints, UI rendering

#### `packages/shared` — Shared Domain Layer

- Domain enums (`THREAD_STATUSES`, `MESSAGE_DIRECTIONS`, etc.)
- TypeScript types for domain entities
- Zod validation schemas (organized into domain-specific files: `auth.ts`, `contacts.ts`, `drafts.ts`, `messages.ts`, `senders.ts`, `threads.ts`, `workspaces.ts`)
- Shared constants (`BCRYPT_ROUNDS`, `OTP_LENGTH`, etc.)
- Error codes (`ERROR_CODES`)
- HTTP status codes (`STATUS_CODES`)
- Human-readable messages (`MESSAGES`)
- Queue names (`QUEUES`)
- Job names (`JOBS`)
- **No business logic or side effects**

#### `packages/db` — Database Layer

- Drizzle ORM schema definitions for all tables
- Migration files (generated and managed by Drizzle Kit)
- Typed query helpers and repository building blocks
- Exports a pre-configured database client
- **No business rules** — repositories in `apps/api` consume this package

#### `packages/ai` — AI Integration Layer

- Abstract interface for AI providers (OpenAI, etc.)
- Prompt templates and generation utilities
- Exposes `aiProvider.generate()` — the only entry point application code should call
- **Allowed to reference:** Drizzle schema types (for context), thread/message models
- **Not allowed:** direct HTTP responses, database writes

#### `packages/email` — Email Integration Layer

- Abstract interface for email providers (SendGrid, etc.)
- Exposes `emailProvider.send()` — the only entry point application code should call
- Factory function `createEmailProvider(provider, config)` returns the correct provider instance
- Handles provider-specific configuration (API keys, webhook verification)
- **Allowed:** delivery/receive methods through the provider abstraction
- **Not allowed:** direct provider SDK calls from application code

#### `packages/types` — Utility Types

- Generic TypeScript utility types (e.g., `DeepPartial`, `PaginatedResult`)
- Type guards and assertion functions
- Shared type helpers used across multiple packages
- **No runtime code or domain logic**

#### `infra/docker` — Local Development Environment

- Docker Compose configuration for PostgreSQL, Redis, and other services
- Used for consistent local development across the team

#### `infra/nginx` — Reverse Proxy

- Nginx configuration for production deployments
- Routes traffic to the appropriate app (api, web)

#### `context/` — Project Documentation

- Domain model diagrams and entity relationships
- Code standards (this file)
- Project overview, goals, and design principles
- Progress tracking

---

## Logging

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
logger.info(`Thread ${threadId} updated`);
```

- Always pass structured objects, never string templates
- Include contextual IDs (`workspaceId`, `threadId`, `messageId`) where available
- Use appropriate log levels: `debug`, `info`, `warn`, `error`

---

## Providers

Application code accesses providers through abstractions.

Allowed:

```ts
emailProvider.send();
aiProvider.generate();
```

Not allowed outside integration layer:

```ts
sendgrid.send();
openai.responses.create();
```

Every provider must:

- Be accessed through a single abstraction interface
- Support swapping implementations without changing application code
- Be configured per workspace where relevant (e.g., sender-level provider config)

---

## Backend

### Controllers

Allowed:

- request validation
- authentication
- service calls
- response mapping

Not allowed:

- business logic
- database queries

### Services

Contains:

- business rules
- orchestration
- transaction boundaries

### Repositories

Contains:

- selects
- inserts
- updates
- deletes

No business rules.

### Guards

Use guards for cross-cutting request concerns like header extraction and authorization.

Example — `workspace-id.guard.ts`:

```ts
// apps/api/src/guards/workspace-id.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppError } from '../errors/AppError';
import { Request } from 'express';
import { ERROR_CODES, MESSAGES, STATUS_CODES } from '@repo/shared';

@Injectable()
export class WorkspaceIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request & { workspaceId: string } = context.switchToHttp().getRequest();
    const workspaceId = request.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new AppError(
        ERROR_CODES.MISSING_WORKSPACE_ID,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.MISSING_WORKSPACE_ID,
      );
    }

    request.workspaceId = workspaceId;
    return true;
  }
}
```

Usage in controllers:

```ts
@UseGuards(JwtAuthGuard, WorkspaceIdGuard)
@Controller('senders')
export class SendersController {
  @Post()
  create(@Req() req: UserRequest, @Body() body: CreateSenderInput) {
    return this.sendersService.createSender(body, req.workspaceId);
  }
}
```

Rules:

- Guards must not contain business logic — only request validation and authorization
- Attach validated values to the request object (e.g., `req.workspaceId`) so downstream code doesn't re-extract headers
- Use `AppError` for all guard failures — never throw raw `Error` or NestJS built-in exceptions

### Error Handling

In `apps/api`, always use the `AppError` class for throwing errors. Never use raw `Error` or NestJS built-in exceptions (`ConflictException`, `NotFoundException`, `ForbiddenException`, etc.).

`AppError` expects three arguments:

```ts
throw new AppError(code, statusCode, message);
```

- `code` — a string constant from `packages/shared/src/error-codes.ts` (imported as `ERROR_CODES` from `@repo/shared`)
- `statusCode` — a numeric HTTP status from `packages/shared/src/status-codes.ts` (imported as `STATUS_CODES` from `@repo/shared`)
- `message` — a human-readable string from `packages/shared/src/messages.ts` (imported as `MESSAGES` from `@repo/shared`)

Example:

```ts
import { ERROR_CODES, STATUS_CODES, MESSAGES } from '@repo/shared';

throw new AppError(
  ERROR_CODES.SENDER_NOT_FOUND,
  STATUS_CODES.NOT_FOUND,
  MESSAGES.error.SENDER_NOT_FOUND,
);
```

When adding a new error:

1. Add the code to `ERROR_CODES` in `packages/shared/src/error-codes.ts`
2. Add the message to `MESSAGES.error` in `packages/shared/src/messages.ts`
3. Add a new HTTP status code to `STATUS_CODES` in `packages/shared/src/status-codes.ts` only if absolutely necessary — reuse existing values
4. Re-export from `packages/shared/src/index.ts` if adding a new file

### Module Boundaries

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

## API

### Resource Naming

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

- Use plural nouns, not verbs
- Nest related resources: `/threads/:threadId/messages`
- Query parameters for filtering, sorting, and pagination

### Validation

Validate:

- body
- params
- query

before service execution.

- Use Zod schemas from `packages/shared` for request validation
- Schemas are organized into domain-specific files under `packages/shared/src/schemas/`:
  - `auth.ts` — registration, login, OTP verification
  - `contacts.ts` — contact CRUD and list queries
  - `drafts.ts` — draft CRUD and send
  - `messages.ts` — message queries
  - `senders.ts` — sender CRUD and list queries
  - `threads.ts` — thread queries and status updates
  - `workspaces.ts` — workspace creation and invitations
- All schemas are re-exported via `packages/shared/src/schemas/index.ts` (and transitively from `@repo/shared`)
- Fail fast — invalid requests must not reach the service layer

---

## Frontend

### TanStack Query

Used for:

```text
contacts
threads
messages
settings
```

Server state only.

- All server data flows through TanStack Query hooks
- Cache keys should follow a consistent pattern: `[resource, ...filters]`
- Mutations must invalidate or optimistically update relevant queries

### Zustand

Used for:

```text
modals
drawers
filters
temporary UI state
```

Do not duplicate TanStack Query data.

- Zustand is for UI-only state that has no server-side representation
- Never store fetched data in Zustand — use TanStack Query cache instead

### Components

Maximum responsibility:

```text
render UI
handle interaction
```

Data fetching belongs in hooks.

- Components should receive data as props or consume it via hooks
- Never call APIs or query databases directly from a component
- Extract reusable logic into custom hooks

---

## Queues

Every BullMQ job must:

- be idempotent
- support retries
- support duplicate execution

### Queue and Job Names

Queue names are defined as constants in `packages/shared/src/queue-names.ts`:

```ts
// packages/shared/src/queue-names.ts
export const QUEUES = {
  EMAIL: 'email',
} as const;
```

Job names are defined as constants in `packages/shared/src/job-names.ts`:

```ts
// packages/shared/src/job-names.ts
export const JOBS = {
  SEND_EMAIL: 'send-email',
} as const;
```

Always reference queue and job names via these constants, never as raw strings:

```ts
import { JOBS, QUEUES } from '@repo/shared';

// queue registration (worker)
BullModule.registerQueue({ name: QUEUES.EMAIL });

// job enqueue (api)
await this.queue.add(JOBS.SEND_EMAIL, jobPayload);
```

### Queue Service Pattern

Queue enqueuing in `apps/api` goes through a dedicated queue service:

```ts
// apps/api/src/modules/email-queue/email-queue.service.ts
import { JOBS, QUEUES } from '@repo/shared';

@Injectable()
export class EmailQueueService {
  private queue: Queue<SendEmailJob>;

  constructor() {
    this.queue = new Queue<SendEmailJob>(QUEUES.EMAIL, { connection: { ... } });
  }

  async enqueueSendEmail(job: SendEmailJob) {
    await this.queue.add(JOBS.SEND_EMAIL, job);
  }
}
```

- Services in `apps/api` inject the queue service, never interact with BullMQ queues directly
- Job handlers/processors are defined in `apps/worker`
- Job payload types are defined in `packages/types/src/queue.ts`
- Failed jobs must log structured context for debugging

---

## Realtime

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

- `noun` is the domain entity (`message`, `thread`, `reply`)
- `event` is the past-tense action (`sent`, `updated`, `received`)
- Events are emitted from the backend and consumed by the frontend for live updates

---

## Architecture Constraints

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
