Run the CLAUDE-CODE-RULES.md compliance checklist on all modified files and fix every violation found.

## Step 1 — Discover modified files

```bash
git diff --name-only HEAD
git status --short
```

Filter for `.ts` and `.tsx` files in `client/` and `server/src/`.

## Step 2 — Run greps on each modified file

For each file, run all of these and list every violation:

```bash
# Arrow functions — no export function / function declarations
grep -n "^export function\|^function " <file>

# T[] notation — must be Array<T>
grep -n "string\[\]\|number\[\]\|boolean\[\]\|any\[\]" <file>

# any without eslint-disable
grep -n ": any\|<any>" <file>

# console.log
grep -n "console\.log" <file>

# Direct shadcn/ui imports (must go through @/components/shared)
grep -n 'from "@/components/ui/' <file>

# Hardcoded color tokens (should use semantic tokens)
grep -n "text-gray-\|bg-gray-\|text-slate-\|bg-slate-\|bg-white\b" <file>

# Functions in types files (*.types.ts) — move to utils
grep -n "^export const\|^export function\|^const\|^function " <file>   # only for *.types.ts

# Module-level standalone functions in hook files (use*.ts) — move to utils
grep -n "^const \|^function " <file>   # only for use*.ts
```

**File responsibility rules — check manually:**

- `page.tsx` → server component: data fetch + prop passing ONLY. No hooks, no `useEffect`.
- `ComponentName.tsx` → JSX + hook calls ONLY. No `useState`, `useEffect`, standalone functions.
- `useXxx.ts` → hooks, state, effects, callbacks. No module-level standalone functions.
- `types/index.ts` / `*.types.ts` → only `type`, `interface`, `enum`. Nothing else.
- `*.service.ts` → API functions only. Every auth method takes `token` as first param.

**Auth patterns to verify:**

- Server components: `const { getToken } = await auth()` from `@clerk/nextjs/server`
- Client components: `const { getToken } = useAuth()` from `@clerk/nextjs`
- Services: `token` is always the first parameter

## Step 3 — Run ESLint

```bash
git diff --name-only HEAD | grep -E '\.(ts|tsx)$' | while read f; do [ -f "$f" ] && echo "$f"; done | xargs npx eslint 2>&1
```

Zero errors required. Fix every ESLint error — including pre-existing ones in files you touched.

## Step 4 — Fix ALL violations

Do not skip any, do not mark pre-existing violations as "not my problem." Touching a file means owning it fully.

After fixing, re-run the greps and ESLint to confirm zero results.

## Step 5 — Report

List:
- Files checked
- Violations found per file (type + line)
- Confirmation that all are resolved
