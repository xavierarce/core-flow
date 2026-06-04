# XAC Capital — Code Rules

---

## Fundamental Rule

> **Every file you touch must be fully compliant with these rules.**
> If a file has pre-existing violations and you modify it, fix those too.
> There is no "it was already there before."

---

## Automated Verification Checklist

Run these greps on every modified file and fix ALL results.

```bash
# 1. Function declarations — use arrow functions
grep -n "^export function\|^function " <file>

# 2. T[] notation — use Array<T>
grep -n "string\[\]\|number\[\]\|boolean\[\]\|any\[\]" <file>

# 3. any without eslint-disable
grep -n ": any\|<any>" <file>

# 4. console.log
grep -n "console\.log" <file>

# 5. Direct shadcn/ui imports (must go through @/components/shared)
grep -n 'from "@/components/ui/' <file>

# 6. Hardcoded Tailwind color tokens
grep -n "text-gray-\|bg-gray-\|text-slate-\|bg-slate-\|bg-white\b\|text-white\b" <file>

# 7. Functions in types files (move to a utils file)
grep -n "^export const\|^export function\|^const\|^function " <file>   # only *.types.ts

# 8. ESLint — zero errors on modified files
git diff --name-only HEAD | grep -E '\.(ts|tsx)$' | while read f; do [ -f "$f" ] && echo "$f"; done | xargs npx eslint 2>&1
```

---

## Arrow Functions — Required

```ts
// ❌ Forbidden
export function MyComponent(props: Props) { ... }
export function useMyHook() { ... }
function helperFn() { ... }

// ✅ Required
export const MyComponent = (props: Props): ReactNode => { ... }
export const useMyHook = (): ReturnType => { ... }
const helperFn = (): void => { ... }
```

**Single exception:** `forwardRef` inner function can be anonymous, but the component must have `.displayName`.

```ts
const MyComp = forwardRef<Handle, Props>(({ value }, ref) => { ... });
MyComp.displayName = "MyComp";
```

---

## Types — Required

```ts
// ❌ Forbidden
string[]
number[]
any
import { MyType } from "..."

// ✅ Required
Array<string>
Array<number>
unknown       // for genuinely unknown values — narrow before use
import type { MyType } from "..."
```

**`any` vs `unknown`:** `any` bypasses TypeScript entirely. `unknown` forces you to narrow before using. Every time you want to write `any`, write `unknown` instead — then narrow.

```ts
// ❌ Forbidden
const process = (val: any) => val.toUpperCase();

// ✅ Required
const process = (val: unknown): string => {
  if (typeof val === "string") return val.toUpperCase();
  return "";
};
```

**Strong typing at system boundaries — Required**

At system boundaries (things you don't control), use `unknown` and narrow before use:

- External API responses (`fetch`)
- `JSON.parse()` — returns `any`, cast to `unknown` immediately
- `catch (e)` blocks — `e` is `unknown`, don't cast to `Error` without checking

```ts
// ❌ Forbidden
catch (e) {
  console.error((e as Error).message);
}

// ✅ Required
catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  console.error(message);
}
```

---

## File Responsibility — Required

Each file type has exactly one role. A file with two roles is wrong — split it.

| File | Allowed | Forbidden |
|---|---|---|
| `ComponentName.tsx` | JSX return + calling the component's hook | `interface`, `type`, `useState`, `useEffect`, `const` that isn't the component |
| `ComponentName.types.ts` | `interface`, `type`, `enum` | Everything else — no functions, no constants, no logic |
| `ComponentName.utils.ts` | Pure functions, Zod schemas, constants | React hooks, JSX, state |
| `useComponentName.ts` | All `useState`, `useEffect`, handlers, form logic | Module-level standalone functions (those go to utils) |
| `page.tsx` | `await auth()`, data fetching, passing props to components | Hooks, client state, business logic |
| `*.service.ts` | API call functions | Components, hooks, types |

### What belongs where — concrete examples

```ts
// ❌ Wrong — interface declared in a .tsx file
// AddTransactionDialog.tsx
interface AddTransactionDialogProps { ... }       // ← move to .types.ts
const formSchema = z.object({ ... })              // ← move to .utils.ts
const [open, setOpen] = useState(false)           // ← move to useAddTransactionDialog.ts
const onSubmit = async (values) => { ... }        // ← move to useAddTransactionDialog.ts
export const AddTransactionDialog = () => { ... } // ✅ only this stays

// ✅ Correct — one file, one role
// AddTransactionDialog.types.ts
export interface AddTransactionDialogProps {
  accounts: Array<Account>;
  categories: Array<Category>;
}

// AddTransactionDialog.utils.ts
export const formSchema = z.object({ ... });

// useAddTransactionDialog.ts
export const useAddTransactionDialog = (props: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const onSubmit = async (values) => { ... };
  return { open, setOpen, onSubmit, form };
};

// AddTransactionDialog.tsx  ← JSX only
import type { AddTransactionDialogProps } from "./AddTransactionDialog.types";
import { useAddTransactionDialog } from "./useAddTransactionDialog";
export const AddTransactionDialog = (props: AddTransactionDialogProps) => {
  const { open, setOpen, onSubmit, form } = useAddTransactionDialog(props);
  return ( ... JSX only ... );
};
```

### File structure per component

Every non-trivial component (anything with state, forms, or handlers) lives in its own folder:

```
ComponentName/
├── ComponentName.tsx          # JSX + hook call only
├── ComponentName.types.ts     # interfaces and types only
├── ComponentName.utils.ts     # pure functions, Zod schemas, constants
└── useComponentName.ts        # all useState, useEffect, handlers
```

Simple display-only components (no state, no handlers) can stay as a single `.tsx` file — but the moment you add state or a handler, split into the folder structure.

---

## Services — Plain Objects with Token-First Signatures

Services are plain objects exported as `const`. Every method that requires auth takes `token` as the first argument.

```ts
// ✅ Correct pattern
export const AccountsService = {
  async getAll(token: string | null): Promise<Account[]> { ... },
  async create(token: string, data: CreateAccountDto): Promise<Account> { ... },
  async update(token: string, id: string, data: Partial<Account>): Promise<Account> { ... },
  async delete(token: string, id: string): Promise<void> { ... },
};
```

---

## Auth Pattern

```ts
// Server component — auth() from @clerk/nextjs/server
const { getToken } = await auth();
const token = await getToken();
if (!token) return null;

// Client component — useAuth() from @clerk/nextjs
const { getToken } = useAuth();
const token = await getToken();
if (!token) return;
```

---

## React & Next.js

- **Server components** fetch data — never use hooks or browser APIs
- **Client components** — add `"use client"` at the top, handle all interactivity
- Prefer server-fetch → props over client-side `useEffect` fetching
- Use `useState` for local UI state; consolidate related state into one object
- Keep client component surface area small — wrap only what needs interactivity

---

## UI Components

- Always import through `@/components/shared`, never directly from `@/components/ui`
- Never create a new UI primitive if `AppCard`, `AppButton`, or a Shadcn component already exists
- To add a new Shadcn primitive: `npx shadcn@latest add <component>` → wrap in `components/shared/` → import from there

---

## Code Quality

- **Max 250 lines per file** — exceptions: types files, complex service files
- **No `console.log`** — remove before committing
- **No anonymous functions** in module scope — give every function a name
- **No unused imports** — remove them
- Wrap mutations in `try/catch`, surface typed error messages

---

## Architecture Rules

- `app/(app)/*/page.tsx` — server component only: fetch data, pass to feature components
- Feature components in `components/features/[domain]/` — render only, client when needed
- Shared primitives in `components/shared/` — no domain logic
- Types in `types/index.ts` — all interfaces in one place for a project this size
- Utilities in `lib/` — pure functions only (`account.utils.tsx`, etc.)

---

## Merge / PR Checklist

- Zero duplicate code — extract shared logic
- Zero unused files — delete dead code
- Zero unused imports
- Zero `console.log`
- All modified files pass the automated greps above
