# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- [x] Monorepo Scaffolding
- [x] Domain Model & Database Schema
- [x] Shared Constants & Enums
- [ ] API Implementation
- [ ] Web Frontend Implementation
- [ ] Worker Implementation
- [ ] AI Package
- [ ] Email Package
- [ ] Types Package
- [ ] Authentication & Authorization
- [ ] Provider Integrations
- [ ] Realtime & Notifications
- [ ] Deployment & CI/CD

## Current Goal

Complete the core domain layer and shared infrastructure before building out application features. The database schema and shared enums are done; the next focus is implementing API endpoints and business logic.

## Completed

### Monorepo Foundation
- pnpm workspace with Turborepo configured
- TypeScript base config (`tsconfig.base.json`)
- ESLint config (`eslint.config.js`)
- Prettier config (`.prettierrc`, `.prettierignore`)
- Turbo pipeline (`turbo.json`) with dev/build tasks

### Database Package (`@repo/db`)
- Drizzle ORM setup with PostgreSQL (`drizzle-orm`, `drizzle-kit`)
- Database client factory (`createDb`) using `node-postgres` Pool
- Drizzle Kit config (`drizzle.config.ts`) pointing to `apps/api/.env` for DB_URL
- All core domain tables defined as Drizzle schema:

| Table | File | Key Columns |
|-------|------|-------------|
| `users` | `packages/db/src/schema/user.ts` | email (unique), passwordHash, firstName, lastName, isEmailVerified, softDelete, timestamps |
| `workspaces` | `packages/db/src/schema/workspace.ts` | name, timestamps |
| `workspace_members` | `packages/db/src/schema/workspace-member.ts` | workspaceId, userId, role, timestamps |
| `senders` | `packages/db/src/schema/sender.ts` | workspaceId, name, email, provider, providerConfig (JSONB), timestamps |
| `contacts` | `packages/db/src/schema/contact.ts` | workspaceId, email, firstName, lastName, company, title, linkedinUrl, notes, softDelete, timestamps |
| `threads` | `packages/db/src/schema/thread.ts` | workspaceId, contactId, senderId, status, lastMessageAt, timestamps |
| `messages` | `packages/db/src/schema/message.ts` | workspaceId, threadId, providerMessageId, direction (enum), status, subject, body, scheduledFor, sentAt, deliveredAt, timestamps |

- Common schema helpers:
  - `id.ts` — text-based primary key (`id: text('id').primaryKey()`)
  - `timestampts.ts` — `createdAt` and `updatedAt` with timezone, defaultNow
  - `soft-delete.ts` — nullable `deletedAt` timestamp for soft-delete pattern

### Shared Package (`@repo/shared`)
- Domain enums:
  - `THREAD_STATUSES` — `['waiting_reply', 'needs_action', 'closed']`
  - `MESSAGE_DIRECTIONS` — `['inbound', 'outbound']`
  - `MESSAGE_STATUSES` — `['scheduled', 'queued', 'sent', 'failed']`
  - `SENDER_PROVIDERS` — `['sendgrid']`
- Corresponding TypeScript types exported: `ThreadStatus`, `MessageDirection`, `MessageStatus`, `SenderProvider`
- Code follows code-standards: string literal unions (`as const`) over TypeScript enums

### API App (`@repo/api`) — NestJS
- NestJS scaffolded with `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- Basic `AppModule`, `AppController`, `AppService` (boilerplate only)
- Environment config (`apps/api/src/config/env.ts`, `apps/api/src/config/db.ts`)
- `main.ts` with NestFactory bootstrapping, reads PORT from env
- Dependencies: `@repo/db`, `@repo/shared`, `@repo/types`
- Logging: Pino via `nestjs-pino`

### Web App (`@repo/web`) — Next.js 16
- Next.js 16 with React 19, Tailwind CSS v4
- Basic `layout.tsx`, `page.tsx`, `globals.css` (boilerplate only)
- Environment config (`apps/web/src/env.ts`)
- Dependencies: `@repo/shared`

### Worker App (`worker`) — NestJS
- NestJS scaffolded identically to API
- Basic `AppModule`, `AppController`, `AppService` (boilerplate only)
- Environment config (`apps/worker/config/env.ts`, `apps/worker/config/db.ts`)
- Dependencies: `@repo/db`, `@repo/shared`, `@repo/types`
- Logging: Pino via `nestjs-pino`

### Infrastructure
- Docker Compose (`infra/docker/compose.yml`)
- Nginx configuration (`infra/nginx/`)
- Scripts directory (`infra/scripts/`)

### Documentation
- `context/project-overview.md` — Comprehensive overview with goals, user flow, domain model, features, scope, success criteria, design principles
- `context/code-standards.md` — Detailed standards for TypeScript, naming, backend (controllers/services/repositories), API design, frontend (TanStack Query, Zustand), realtime events, queues, providers, logging, monorepo structure

## In Progress

- None currently.

## Next Up

1. **Generate and run initial database migration** — run `drizzle-kit generate` and `drizzle-kit migrate` to create tables in PostgreSQL
2. **Implement authentication module** (`apps/api`) — user registration, login, JWT session management, password hashing
3. **Implement workspace management** — CRUD for workspaces, member invitations, role-based access
4. **Implement contact management endpoints** — CRUD for contacts within a workspace
5. **Populate `@repo/types` package** — shared TypeScript types/interfaces for API contracts (request/response DTOs)
6. **Populate `@repo/ai` package** — AI provider abstraction, prompt templates, email generation
7. **Populate `@repo/email` package** — email provider abstraction, SendGrid integration, send/status methods
8. **Build web frontend pages** — auth screens, workspace dashboard, contacts, thread inbox, email composer
9. **Implement worker jobs** — email sending queue, reply processing, tracking event processing
10. **Realtime notifications** — WebSocket events for message/thread/reply updates

## Open Questions

- **Auth provider strategy** — JWT-only or session-based? Will there be OAuth (Google, GitHub) in addition to email/password?
- **Email provider** — Only SendGrid initially, or plan for multiple providers from the start? The `SENDER_PROVIDERS` enum currently only has `'sendgrid'`.
- **AI provider** — Which LLM provider(s) to integrate? OpenAI, Anthropic, or a provider-agnostic abstraction?
- **Message ID strategy** — The schema uses text-based IDs (`id: text('id').primaryKey()`). Are these UUIDs, ULIDs, or CUIDs? The generation strategy is not yet implemented.
- **Soft delete scope** — `users` and `contacts` have soft delete. Should `workspaces`, `senders`, `threads`, or `messages` also support soft delete?
- **Database relationships** — The schema currently has no foreign key constraints or Drizzle relations defined. Should relations be added for type-safe queries, or keep it loose?
- **Multi-tenancy isolation** — How to enforce workspace-level data isolation at the query layer? Row-level security (RLS) in PostgreSQL, or application-level filtering?
- **Email tracking** — How will open/click tracking work? Pixel tracking for opens, link wrapping for clicks? This affects the message and tracking schema.
- **Rate limiting** — What rate limits should apply to sending? Per workspace, per sender, per time window?

## Architecture Decisions

- **Monorepo with Turborepo** — Chose pnpm workspaces + Turborepo for shared packages, parallel builds, and dependency graph awareness. This enables clear package boundaries and code reuse across apps.
- **Drizzle ORM over Prisma** — Chose Drizzle for its lightweight, SQL-like API, better TypeScript inference, and no code generation step. Drizzle Kit handles migrations.
- **Text-based IDs over auto-increment** — All primary keys use `text('id').primaryKey()`. This avoids sequential ID exposure, supports distributed ID generation (ULID/UUID), and simplifies multi-environment sync. The actual ID generation strategy (UUID, ULID, CUID) is still to be decided.
- **Soft delete pattern** — Applied to `users` and `contacts` using a nullable `deletedAt` timestamp. This preserves data for auditing and recovery while hiding it from normal queries. Not yet applied to all entities — decision needed on scope.
- **String literal unions over TypeScript enums** — Following code-standards, all enum-like constants use `as const` arrays with derived types. This produces cleaner JavaScript output and better aligns with TypeScript best practices.
- **NestJS for API and Worker** — Chose NestJS for its modular architecture, dependency injection, and built-in support for guards, interceptors, pipes. The worker also uses NestJS for consistency and shared module structure (though a lighter framework like plain BullMQ workers could have sufficed).
- **Next.js 16 for Web** — Chose Next.js for its React Server Components, App Router, and full-stack capabilities. Tailwind CSS v4 for styling.
- **Pino for logging** — Structured JSON logging via `nestjs-pino` and `pino`. Aligned with the code-standards requirement of structured log objects over string interpolation.
- **Workspace-scoped data model** — Every business entity (`senders`, `contacts`, `threads`, `messages`) carries a `workspaceId`. No cross-workspace data access. This is the foundation for multi-tenancy.
- **Thread-centric conversation model** — Threads are the central entity tying together contacts, senders, and messages. A thread owns its status and the sender/contact relationship. Messages reference the thread and carry direction (inbound/outbound), status, and delivery timestamps. This aligns with the project-overview design principle.

## Session Notes

- **Last session:** Monorepo scaffolding, database schema design, shared enum definitions. All six core tables are defined. Apps are scaffolded with boilerplate but have no real functionality. The project is in early phase — foundation laid, ready to start building features.
- **To resume:** Start with database migration to create tables, then begin implementing authentication in the API app. The `@repo/types` package needs to be populated with shared DTOs before heavy API work begins.
- **Key files for next session:**
  - Database schema: `packages/db/src/schema/*.ts`
  - Domain enums: `packages/shared/src/domain/enums.ts`
  - API entry: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
  - Project overview: `context/project-overview.md`
  - Code standards: `context/code-standards.md`
- **Environment setup needed:** PostgreSQL database must be running (Docker Compose available at `infra/docker/compose.yml`). `.env` file needed at `apps/api/.env` with `DB_URL` and `PORT`.