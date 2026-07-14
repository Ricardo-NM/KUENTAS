# Auth Prisma PostgreSQL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build registration, login, remembered sessions, protected `/inicio`, and secure logout with Prisma and PostgreSQL.

**Architecture:** Use Next.js App Router Server Actions for auth mutations, Prisma for persistence, bcrypt for password hashing, and opaque database-backed session cookies. Client forms keep current validation UX while server helpers enforce the same rules.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, Prisma, PostgreSQL in Docker, Zod, bcryptjs, Node crypto, Vitest.

## Global Constraints

- Read `node_modules/next/dist/docs/` before coding against Next.js APIs.
- Registration redirects to `/login` only after showing the success modal for 3 seconds.
- Login errors must say `Alguno de los campos es incorrecto` and mark both inputs red.
- `/inicio` must be protected and include a secure `Cerrar sesión` action.
- Cookies must be `httpOnly`, `sameSite=lax`, `path=/`, and `secure` in production.
- Store only password hashes and session token hashes.

---

### Task 1: Dependencies, Prisma, and Docker

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `prisma/schema.prisma`
- Modify: `package.json`

**Interfaces:**
- Produces Prisma models `User` and `Session`.
- Produces scripts `prisma:generate`, `prisma:migrate`, and `test`.

- [ ] Install `@prisma/client`, `bcryptjs`, `zod`, `prisma`, and `vitest`.
- [ ] Add PostgreSQL service with database `kuentas`.
- [ ] Add Prisma schema with `User` and `Session`.
- [ ] Generate Prisma client.

### Task 2: Auth Helpers With Tests

**Files:**
- Create: `lib/auth/validation.ts`
- Create: `lib/auth/password.ts`
- Create: `lib/auth/session.ts`
- Create: `lib/prisma.ts`
- Create: `lib/auth/*.test.ts`

**Interfaces:**
- `registerSchema.safeParse(input)`
- `loginSchema.safeParse(input)`
- `hashPassword(password: string): Promise<string>`
- `verifyPassword(password: string, hash: string): Promise<boolean>`
- `createSession(userId: string, remember: boolean): Promise<{ cookieValue: string; expiresAt: Date }>`
- `getCurrentSession(): Promise<{ userId: string } | null>`
- `destroyCurrentSession(): Promise<void>`

- [ ] Write failing tests for validation and password hashing.
- [ ] Implement validation and password helpers.
- [ ] Write failing tests for session token parsing/hash helpers.
- [ ] Implement session helpers with opaque random tokens.

### Task 3: Server Actions

**Files:**
- Create: `app/(auth)/actions.ts`
- Create: `app/inicio/actions.ts`

**Interfaces:**
- `registerAction(prevState, formData)` returns `{ status, message?, errors? }`.
- `loginAction(prevState, formData)` returns `{ status, message? }`.
- `logoutAction()` deletes session and redirects to `/login`.

- [ ] Write tests for pure auth action helpers where practical.
- [ ] Implement registration with duplicate-email protection and bcrypt hashing.
- [ ] Implement login with generic credential errors and session cookie creation.
- [ ] Implement logout with DB session deletion and cookie deletion.

### Task 4: Forms and Protected Page

**Files:**
- Modify: `app/(auth)/registro/register-form.tsx`
- Modify: `app/(auth)/login/login-form.tsx`
- Create: `app/inicio/page.tsx`
- Create: `app/inicio/logout-button.tsx`

**Interfaces:**
- Client forms invoke Server Actions with `useActionState`.
- `/inicio` calls `getCurrentSession()` server-side and redirects unauthenticated users.

- [ ] Wire registration form submit to `registerAction`.
- [ ] Add success modal and 3-second redirect to `/login`.
- [ ] Wire login form submit to `loginAction`.
- [ ] Add invalid credential message and red borders.
- [ ] Add `/inicio` text and functional logout button.

### Task 5: Verification

**Files:**
- Modify only if verification exposes a defect.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] If Docker is available, run PostgreSQL and apply Prisma migration.

