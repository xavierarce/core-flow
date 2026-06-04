Do a UX/UI review of all files modified in the current worktree (`git diff --name-only`).

For each modified file, analyze:

## 1. Color Tokens

Detect hardcoded or wrong color classes:
- **Forbidden:** `text-gray-*`, `bg-gray-*`, `text-slate-*`, `bg-slate-*`, `bg-white`, `border-gray-*`, hex literals in `style={}` (e.g. `#ffffff`, `#e5e7eb`)
- **Required:** `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`, `bg-muted`, `border-border`
- **Brand:** `text-emerald-500 / text-emerald-400` for positive states, `bg-emerald-500/15` for badges
- **Status:** `text-blue-400 / bg-blue-500/15`, `text-red-400 / bg-red-500/15`, `text-amber-400 / bg-amber-500/15`

## 2. Component Imports

Verify that `Button`, `Card`, `Input`, dialogs, etc. come from `@/components/shared`, not:
- `@/components/ui/button` (raw Shadcn)
- any external library directly

## 3. Layout Consistency

- Pages should start with `<PageHeader title="..." subtitle="..." />`
- Panels/sections should use `<AppCard title="..." ...>`
- Page layout should follow `max-w-4xl mx-auto space-y-8` (settings/forms) or `max-w-7xl` (data-dense pages)
- Grid layouts: `grid gap-8 md:grid-cols-2` for two-column, `grid gap-6 md:grid-cols-3` for three-column

## 4. Semantic Structure

- Financial amounts: check that `formatBalance(balance, currency)` is used, not raw number formatting
- Account types: check that status badges use the `bg-{color}/15 text-{color}-400 border border-{color}/30` pattern
- Empty states: should use `text-muted-foreground text-sm` centered in the container

## 5. Behavior Risks

- `py-*` changed to `p-*` on a parent → adds unwanted horizontal padding
- Dark mode: avoid `invert` or `brightness` filters on colored icons
- Removing hover parent without checking that `group-hover:opacity-100` children still work
- Spacing jumps: e.g. changing `gap-1` (4px) to `gap-4` (16px) = 4× increase

## Output Format

For each modified `.tsx` / `.ts` file:

```
### path/to/file.tsx
🔴 Blocking   — [issue] → [fix]
🟡 Fix needed — [issue] → [fix]
🟢 Suggestion — [possible improvement]
✅ OK         — no issues found
```

End with a global summary: files analyzed, critical issues to fix before merge.
