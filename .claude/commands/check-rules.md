Run the CLAUDE-CODE-RULES.md compliance checklist on all modified files and fix every violation found.

## Step 1 — Discover modified files

```bash
git diff --name-only HEAD
git status --short
```

Filter for `.ts` and `.tsx` files in `client/` and `server/src/`.

## Step 2 — Run greps on each modified file

**Important:** Always run greps from the repo root (`core-flow/`), not from `client/` or `server/`. The file paths from `git diff` are relative to the repo root and must be used as-is.

```bash
# From repo root — collect all modified TS/TSX files
FILES=$(git diff --name-only HEAD && git diff --cached --name-only | sort -u | grep -E '\.(ts|tsx)$' | grep -v package)

# Run all checks at once across every file:

# Arrow functions — no export function / function declarations
grep -n "^export function\|^function " $FILES

# T[] notation — must be Array<T>
grep -n "string\[\]\|number\[\]\|boolean\[\]\|any\[\]" $FILES

# any without eslint-disable
grep -n ": any\b\|<any>" $FILES

# console.log
grep -n "console\.log" $FILES

# Direct shadcn/ui imports (must go through @/components/shared)
grep -n 'from "@/components/ui/' $FILES

# Hardcoded color tokens (should use semantic tokens)
grep -n "text-gray-\|bg-gray-\|text-slate-\|bg-slate-\|bg-white\b" $FILES

# Functions in types files — move to utils (run only on *.types.ts and types/index.ts)
grep -n "^export const\|^export function\|^const\|^function " $(echo $FILES | tr ' ' '\n' | grep -E '\.types\.ts$|types/index\.ts$')

# Module-level standalone functions in hook files — move to utils
grep -n "^const \|^function " $(echo $FILES | tr ' ' '\n' | grep -E 'use[A-Z].*\.ts$')
```

**File responsibility — greps that catch violations:**

```bash
# interfaces or type aliases declared inside .tsx files (move to .types.ts)
grep -rn "^interface \|^export interface \|^type \w\+ =\|^export type \w\+ =" \
  $(echo $FILES | tr ' ' '\n' | grep '\.tsx$')

# useState / useEffect / useCallback / useRef / useMemo directly in .tsx (move to useXxx.ts)
grep -rn "useState\|useEffect\|useCallback\|useRef\|useMemo\|useForm\|useRouter\b\|useAuth\b" \
  $(echo $FILES | tr ' ' '\n' | grep '\.tsx$') | grep -v "use[A-Z].*\.ts"

# const declarations at module level in .tsx that are NOT the component export
# (Zod schemas, helper constants — move to .utils.ts)
grep -n "^const \|^export const " \
  $(echo $FILES | tr ' ' '\n' | grep '\.tsx$') | grep -v "export const [A-Z]"

# anything other than type/interface/enum in .types.ts files
grep -n "^export const\|^export function\|^const\|^function\|^import " \
  $(echo $FILES | tr ' ' '\n' | grep '\.types\.ts$')

# useState/useEffect/JSX in .utils.ts files
grep -n "useState\|useEffect\|return (" \
  $(echo $FILES | tr ' ' '\n' | grep '\.utils\.ts$')
```

**Manual checks (can't be grepped precisely):**

- Every component with state or handlers must have a companion `useComponentName.ts`
- The `.tsx` file should only contain the JSX return and one hook call
- `*.types.ts` — zero functions, zero constants, zero logic
- `*.utils.ts` — zero React hooks, zero JSX

**Auth patterns to verify:**

- Server components: `const { getToken } = await auth()` from `@clerk/nextjs/server`
- Client components: `const { getToken } = useAuth()` from `@clerk/nextjs`
- Services: `token` is always the first parameter

## Step 3 — Run ESLint

Run from the `client/` directory, passing paths relative to it:

```bash
cd client && npm run lint 2>&1
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
