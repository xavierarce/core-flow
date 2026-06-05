# XAC Capital — AI Onboarding Context

XAC Capital is a **personal wealth management OS** — a unified platform to track, analyze, and manage all personal capital across cash, savings, investments, crypto, and real estate. Built for one user (Xavier Arce), fully self-hosted, no third-party data aggregators.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Shadcn/UI (New York, slate base) |
| Design system | Professional Dark — oklch CSS variables, next-themes |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Auth | Clerk (JWT) |
| Backend | NestJS v11 (modular monolith) |
| ORM | Prisma v7 |
| Database | PostgreSQL 15 |
| Tests | Vitest |

---

## Repository Layout

```
core-flow/
├── client/                          # Next.js 16 frontend (port 3001)
│   ├── app/
│   │   ├── layout.tsx               # Root: ClerkProvider + ThemeProvider
│   │   └── (app)/
│   │       ├── layout.tsx           # Navbar + page shell
│   │       ├── page.tsx             # / Dashboard
│   │       ├── transactions/page.tsx
│   │       ├── assets/page.tsx
│   │       ├── accounts/page.tsx
│   │       ├── settings/page.tsx
│   │       ├── docs/page.tsx        # Registry-driven docs
│   │       └── docs/map/page.tsx    # CallerTree visualizer
│   ├── components/
│   │   ├── shared/                  # AppCard, AppButton, Navbar, dialogs
│   │   ├── features/                # Feature components (docs/, accounts/, etc.)
│   │   └── layout/                  # PageHeader
│   ├── registry/                    # ALL source-of-truth data (see below)
│   ├── services/                    # API clients (token-first plain objects)
│   ├── types/registry.types.ts      # Union types that drive all enforcement
│   └── lib/                         # Pure utility functions
│
└── server/                          # NestJS backend (port 3000)
    └── src/
        ├── accounts/
        ├── transactions/
        ├── categories/
        ├── category-rules/
        └── auth/                    # AuthGuard + @CurrentUser() decorator
```

---

## The Registry + Enforcement System

This is the most important thing to understand. The project uses a **typed registry** to ensure every route, server module, and architectural node is documented. Undocumented code causes compile errors or test failures.

### How it works

Three layers of enforcement:

**1. TypeScript `satisfies` — compile-time**

Union types in `types/registry.types.ts` are the source of truth:
- `AppRoutePath` — every frontend route path (`"/"`, `"/transactions"`, etc.)
- `ServerModuleKey` — every NestJS module (`"accounts"`, `"transactions"`, etc.)
- `GraphNodeId` — every node in the architecture graph

Every registry uses `satisfies Record<UnionType, DocShape>`, which means TypeScript errors immediately if a key is missing or has the wrong shape.

**2. Filesystem scan — `npm test`**

`__tests__/registry-coverage.test.ts` recursively walks the filesystem and fails if:
- Any `app/(app)/**/page.tsx` exists without a `ROUTES_REGISTRY` entry
- Any `server/src/*/[name].controller.ts` exists without a `MODULES_REGISTRY` entry
- Any `model X` in `schema.prisma` exists without a graph node (path: `schema.prisma:X`)

**3. Graph coverage tests — `npm test`**

Same test file verifies:
- Every route maps to a graph node via `ROUTE_TO_GRAPH_NODE`
- Every module maps to graph nodes via `MODULE_TO_GRAPH_NODES`
- Every graph node has non-empty `role`, `plain`, and `path`

### Registry files

| File | Purpose |
|---|---|
| `registry/routes.registry.ts` | One entry per frontend route — label, status, description, features |
| `registry/modules.registry.ts` | One entry per NestJS module — name, status, controller, service, guards |
| `registry/api.registry.ts` | All REST endpoints — method, path, description, module, guarded |
| `registry/graph.registry.ts` | All architecture nodes + edges + bugs + fixes + enforcement mappings |
| `registry/issues.registry.ts` | Known bugs with severity, description, file reference |

---

## Adding a New Frontend Route

**Every step is required. Skipping any one causes a compile error or test failure.**

```
1. Create   app/(app)/new-page/page.tsx

2. Add to   types/registry.types.ts
            export type AppRoutePath = ... | "/new-page";

3. Add to   registry/routes.registry.ts
            "/new-page": { label: "...", status: "planned", description: "...", features: [...] }
            satisfies Record<AppRoutePath, RouteDoc>  ← errors until step 2+3 done

4. Add to   types/registry.types.ts (GraphNodeId)
            | "route-new-page"

5. Add to   registry/graph.registry.ts (GRAPH_NODES_MAP)
            "route-new-page": N("route-new-page", "routes", "label", "sub", "route", {
              role: "technical description",
              plain: "plain-English explanation",
              path: "client/app/(app)/new-page/page.tsx",
            })

6. Add to   registry/graph.registry.ts (ROUTE_TO_GRAPH_NODE)
            "/new-page": "route-new-page"
            satisfies Record<AppRoutePath, GraphNodeId>  ← errors until done

7. Run      npm run check  ← must be green before committing
```

---

## Adding a New NestJS Module

```
1. Create   server/src/widgets/widgets.module.ts
            server/src/widgets/widgets.controller.ts
            server/src/widgets/widgets.service.ts

2. Add to   types/registry.types.ts
            export type ServerModuleKey = ... | "widgets";

3. Add to   registry/modules.registry.ts
            "widgets": { name: "...", description: "...", status: "stub", controller: "...", service: "...", guards: ["AuthGuard"] }
            satisfies Record<ServerModuleKey, ServerModuleDoc>

4. Add to   registry/api.registry.ts
            { method: "GET", path: "/widgets", description: "...", module: "widgets", guarded: true }

5. Add to   types/registry.types.ts (GraphNodeId)
            | "api-widgets"
            | "server-widgets"

6. Add to   registry/graph.registry.ts (GRAPH_NODES_MAP)
            "api-widgets": N("api-widgets", "api", "WidgetsController", "REST", "route", { role, plain, path })
            "server-widgets": N("server-widgets", "server-services", "WidgetsService", "server", "service", { role, plain, path })

7. Add to   registry/graph.registry.ts (MODULE_TO_GRAPH_NODES)
            "widgets": ["api-widgets", "server-widgets"]
            satisfies Record<ServerModuleKey, [GraphNodeId, GraphNodeId]>

8. Run      npm run check
```

---

## Adding a New Prisma Model

```
1. Add to   server/prisma/schema.prisma
            model Widget { ... }

2. Run      npx prisma migrate dev --name add-widget

3. Add to   types/registry.types.ts (GraphNodeId)
            | "data-widget"

4. Add to   registry/graph.registry.ts (GRAPH_NODES_MAP)
            "data-widget": N("data-widget", "data", "Widget", "Prisma model", "db", {
              role: "...",
              plain: "...",
              path: "server/prisma/schema.prisma:Widget",  ← exact format required for test
            })

5. Run      npm run check  ← Prisma model test now passes
```

---

## Key Patterns

### Server component (data fetch)
```ts
import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";

const Page = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  const accounts = await AccountsService.getAll(token);
  return <FeatureComponent accounts={accounts} />;
};
export default Page;
```

### Client component (mutation)
```ts
"use client";
import { useAuth } from "@clerk/nextjs";
import { AccountsService } from "@/services/accounts.service";

const useMyHook = () => {
  const { getToken } = useAuth();
  const handleCreate = async (data: CreateDto) => {
    const token = await getToken();
    if (!token) return;
    await AccountsService.create(token, data);
  };
  return { handleCreate };
};
```

### Service (token-first)
```ts
export const WidgetsService = {
  async getAll(token: string | null): Promise<Array<Widget>> { ... },
  async create(token: string, data: CreateWidgetDto): Promise<Widget> { ... },
};
```

---

## Data Scoping

Two financial domains — never mix them:

| Domain | Account types | Page |
|---|---|---|
| Cash flow | `CASH`, `SAVINGS` | `/transactions` |
| Wealth | `INVESTMENT`, `TRADING`, `CRYPTO`, `REAL_ESTATE` | `/assets` |

---

## Commands

```bash
# From client/
npm run dev          # Next.js dev (port 3001)
npm run check        # tsc --noEmit && vitest run  ← run before every commit
npm run type-check   # TypeScript only
npm test             # Vitest only
npm run lint         # ESLint

# From server/
npm run start:dev    # NestJS dev (port 3000)

# Database
npx prisma migrate dev    # Create migration
npx prisma generate       # Regenerate client after schema change
npx prisma studio         # Browse data
```

---

## File Responsibility Rules

Every non-trivial component lives in its own folder. One role per file, strictly:

| File | Contains | Forbidden |
|---|---|---|
| `ComponentName.tsx` | JSX return + one hook call | interfaces, useState, consts |
| `ComponentName.types.ts` | interfaces, types, enums | everything else |
| `ComponentName.utils.ts` | pure functions, Zod schemas, constants | hooks, JSX |
| `useComponentName.ts` | useState, useEffect, handlers | module-level consts, JSX |
| `page.tsx` | metadata export + render feature component | hooks, business logic, consts |

---

## Design System Rules

- **Colors**: always semantic tokens — `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `border-border`. Never `text-gray-*`, `text-slate-*`, or hex literals in className.
- **Brand**: emerald (`text-emerald-400`, `bg-emerald-500/15`) for positive/income; red for danger/expense.
- **Components**: always import from `@/components/shared`, never directly from `@/components/ui`.
- **Cards**: use `AppCard`. **Buttons**: use `AppButton` with `variantType` prop.

---

## Known Issues (summary)

See `registry/issues.registry.ts` for the full list. High severity:
- `TransactionsService.update()` ignores amount changes — account balance goes stale
- CORS origin hardcoded to `localhost:3001` in `server/src/main.ts`

---

## Architecture Visualizer

Visit `/docs/map` in the running app to see the CallerTree — select any route to trace its full dependency chain from route → components → services → API → server services → Prisma → PostgreSQL, with known bug/fix counts on each node.
