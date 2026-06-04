# XAC Capital — Developer Context

@CLAUDE-DESIGN.md
@CLAUDE-CODE-RULES.md

## Application Overview

**XAC Capital** is a **personal wealth management OS** — a unified platform to track, analyze, and manage all personal capital across cash, savings, investments, crypto, and real estate.

**Core value proposition:** One place to see your complete financial picture, with manual entry, CSV import, transaction categorization, and (roadmap) live asset pricing.

**Target users:** Individual investors and wealth-conscious individuals who want full control over their financial data without sharing it with third-party aggregators.

---

## Tech Stack

| Layer            | Technology                                            |
|------------------|-------------------------------------------------------|
| Framework        | Next.js 16 (App Router, React 19, TypeScript)         |
| Styling          | Tailwind CSS v4, Shadcn/UI (New York, slate base)     |
| Design system    | Professional Dark — oklch CSS variables, next-themes  |
| Forms            | React Hook Form + Zod                                 |
| Charts           | Recharts                                              |
| Date utilities   | date-fns                                              |
| CSV parsing      | Papaparse                                             |
| Auth             | Clerk (JWT — `auth()` server, `useAuth()` client)     |
| Backend          | NestJS v11 (modular monolith)                         |
| ORM              | Prisma v7                                             |
| Database         | PostgreSQL 15                                         |
| Unit tests       | Vitest                                                |

---

## Architecture

### Route Group `(app)`

All authenticated pages live under `app/(app)/` and share a single layout with Navbar + page shell:

```
app/
├── layout.tsx              # Root: ClerkProvider + ThemeProvider + fonts only
├── (app)/
│   ├── layout.tsx          # Shared: Navbar + bg-background min-h-screen p-8
│   ├── page.tsx            # Dashboard
│   ├── accounts/page.tsx
│   ├── transactions/page.tsx
│   ├── assets/page.tsx     # Wealth portfolio
│   └── settings/page.tsx
└── globals.css
```

### Server vs Client Components

- **Server components** handle data fetching — call `auth()` + `getToken()`, pass data as props
- **Client components** handle interactivity — call `useAuth().getToken()` before any mutation
- Never fetch data in client components on mount; prefer server-fetch → prop pattern

### Service Layer

All API calls go through service objects in `client/services/`. Every method takes a `token` as the first argument. Services are plain objects (not classes).

```ts
// Server component
const { getToken } = await auth();
const token = await getToken();
const accounts = await AccountsService.getAll(token);

// Client component
const { getToken } = useAuth();
const token = await getToken();
await AccountsService.create(token, data);
```

### Data Scoping

Two separate financial domains:

| Domain       | Account types                                           | Page              |
|--------------|---------------------------------------------------------|-------------------|
| Cash flow    | `CASH`, `SAVINGS`                                       | `/transactions`   |
| Wealth       | `INVESTMENT`, `TRADING`, `CRYPTO`, `REAL_ESTATE`        | `/assets`         |

Always filter accounts by type before use — never show all account types everywhere.

### Backend Auth Pattern

Every NestJS controller uses `@UseGuards(AuthGuard)` + `@CurrentUser() user: User`. All service methods take `userId` and scope queries with `where: { userId }`.

```ts
@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.categoriesService.findAll(user.id);
  }
}
```

---

## Directory Structure

```
core-flow/
├── client/                             # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (ClerkProvider + ThemeProvider)
│   │   ├── (app)/layout.tsx            # App shell (Navbar + page wrapper)
│   │   ├── (app)/page.tsx              # Dashboard
│   │   ├── (app)/accounts/page.tsx
│   │   ├── (app)/transactions/page.tsx
│   │   ├── (app)/assets/page.tsx
│   │   └── (app)/settings/page.tsx
│   ├── components/
│   │   ├── shared/                     # Reusable: AppCard, AppButton, Navbar, dialogs
│   │   ├── features/                   # Feature-specific components
│   │   │   ├── accounts/
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   ├── layout/                     # PageHeader
│   │   └── providers/                  # ThemeProvider
│   ├── services/                       # API client (one file per resource)
│   ├── types/index.ts                  # All TypeScript types
│   └── lib/                            # Shared utilities (account.utils.tsx, etc.)
│
└── server/                             # NestJS backend
    └── src/
        ├── accounts/
        ├── transactions/
        ├── categories/
        ├── category-rules/
        ├── auth/                       # AuthGuard + CurrentUser decorator
        └── prisma/                     # PrismaService singleton
```

---

## Key Data Models

| Model            | Purpose                                                   |
|------------------|-----------------------------------------------------------|
| `Account`        | Financial account with type, balance, currency            |
| `Transaction`    | Income/expense entry linked to an account                 |
| `Category`       | User-defined labels (INCOME / EXPENSE) with color         |
| `CategoryRule`   | Keyword → category auto-assignment rule                   |

Account types: `CASH` | `SAVINGS` | `INVESTMENT` | `TRADING` | `CRYPTO` | `REAL_ESTATE`

---

## Development Principles

### Git

- **Never commit unless explicitly asked** — leave changes unstaged; only commit when the prompt explicitly requests it
- **Commit message style** — short imperative, no emojis unless requested

### No Dead Code

- Delete unused files, components, and imports immediately — don't comment them out

### Component Boundaries

- `app/(app)/*/page.tsx` — server component, fetches data, passes to feature components
- `components/features/` — render components, client only when interactivity is required
- `components/shared/` — reusable primitives (`AppCard`, `AppButton`, dialogs, `Navbar`)
- Never put business logic in `page.tsx` beyond data fetching

---

## Common Commands

```bash
# Client (from /client)
npm run dev          # Next.js dev server (port 3001)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit

# Server (from /server)
npm run start:dev    # NestJS dev server (port 3000)
npm run build        # Production build

# Database
npx prisma migrate dev    # Create migration
npx prisma studio         # Prisma Studio UI
npx prisma generate       # Regenerate client after schema change

# Tests (from /client)
npm test             # Vitest unit tests
```

---

## Key Files

| File                                                          | Purpose                                 |
|---------------------------------------------------------------|-----------------------------------------|
| `client/app/globals.css`                                      | CSS variables — Professional Dark palette|
| `client/components/providers/ThemeProvider.tsx`               | next-themes wrapper, defaultTheme="dark" |
| `client/components/shared/AppCard.tsx`                        | Primary card component                  |
| `client/components/shared/AppButton.tsx`                      | Button variants (primary/secondary/danger/outline) |
| `client/components/shared/Navbar.tsx`                         | Top nav with ThemeToggle                |
| `client/components/layout/PageHeader.tsx`                     | Page title + subtitle + action slot     |
| `client/lib/account.utils.tsx`                                | `getAccountIcon()`, `formatBalance()`   |
| `client/types/index.ts`                                       | All shared TypeScript types             |
| `server/src/auth/auth.guard.ts`                               | Clerk JWT verification guard            |
| `server/src/auth/decorators/current-user.decorator.ts`        | `@CurrentUser()` param decorator        |
| `server/prisma/schema.prisma`                                 | Database schema                         |
