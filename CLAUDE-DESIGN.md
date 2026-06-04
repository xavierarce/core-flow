# XAC Capital — Design System Rules

## Core Principles

- Prioritize clarity over decoration
- Prioritize usability over originality
- Prioritize consistency over creativity
- Every UI element must have a purpose
- Reduce cognitive load whenever possible
- Design for fast understanding and efficient usage
- Interfaces should feel predictable and stable

---

## Design System: Professional Dark

XAC Capital uses a **Professional Dark** design system by default. Light mode is available via toggle.

The system is built on oklch CSS variables defined in `app/globals.css` and toggled via `next-themes` (`attribute="class"`).

### Color Tokens — Required

Never use hardcoded colors. Always use semantic CSS variable tokens.

**Forbidden:** `text-gray-*`, `text-slate-*`, `bg-gray-*`, `bg-slate-*`, `bg-white`, `border-gray-*`, hex literals in inline styles (e.g. `#e5e7eb`)

**Backgrounds**

| Token              | Usage                          |
|--------------------|--------------------------------|
| `bg-background`    | Page background (near-black)   |
| `bg-card`          | Card / panel surface           |
| `bg-muted`         | Muted zones, table alternates  |
| `bg-muted/40`      | Subtle hover states            |
| `bg-muted/50`      | Active/selected states         |
| `bg-popover`       | Dropdown / tooltip backgrounds |

**Text**

| Token                    | Usage                         |
|--------------------------|-------------------------------|
| `text-foreground`        | Primary text                  |
| `text-muted-foreground`  | Secondary / placeholder text  |

**Borders**

| Token           | Usage                                |
|-----------------|--------------------------------------|
| `border-border` | Standard border (8% white opacity)   |

**Brand**

| Token                     | Usage                          |
|---------------------------|--------------------------------|
| `text-emerald-500`        | Primary brand text             |
| `text-emerald-400`        | Slightly lighter brand text    |
| `bg-emerald-500/15`       | Brand badge / tag background   |
| `border-emerald-500/30`   | Brand badge border             |

**Status / Semantic**

| Token                  | Usage                 |
|------------------------|-----------------------|
| `text-blue-400`        | Info / Investment     |
| `bg-blue-500/15`       | Info badge background |
| `text-red-400`         | Danger / error        |
| `bg-red-500/15`        | Danger badge background|
| `text-amber-400`       | Warning               |
| `text-purple-400`      | Crypto / Trading      |
| `text-destructive`     | Destructive action text|

---

## Layout & Spacing

- Use Tailwind utility values directly — the project does not have custom spacing tokens
- Prefer semantic grouping with `space-y-*` inside sections
- Page shell: `max-w-4xl mx-auto space-y-8` for single-column, `grid gap-8 md:grid-cols-2` for two-column
- App wrapper (from `(app)/layout.tsx`): `bg-background min-h-screen p-8 max-w-7xl mx-auto`

---

## Typography

- Use a clear visual hierarchy with Tailwind text sizes
- `text-foreground font-semibold text-xl` — page titles (use `PageHeader` component)
- `text-muted-foreground text-sm` — subtitles and descriptions
- `text-foreground text-sm font-medium` — table/list labels
- `text-muted-foreground text-xs` — supporting details
- Use sentence case; avoid all caps except for status badges

---

## Component Patterns

### AppCard

All panels and sections use `AppCard`. Never create custom card divs.

```tsx
import { AppCard } from "@/components/shared";

<AppCard title="Section Title" subtitle="Supporting text" action={<Button />}>
  {/* content */}
</AppCard>
```

### AppButton

Variants map to visual hierarchy:

| `variantType`  | Usage                                       |
|----------------|---------------------------------------------|
| `primary`      | Main action (submit, create, confirm)       |
| `secondary`    | Supporting action (cancel, go back)         |
| `danger`       | Destructive action (delete, remove)         |
| `outline`      | Navigation / neutral action                 |

```tsx
import { AppButton } from "@/components/shared/AppButton";

<AppButton variantType="primary" size="sm">Create</AppButton>
<AppButton variantType="danger" size="sm">Delete</AppButton>
```

### PageHeader

Every page starts with `PageHeader`:

```tsx
import { PageHeader } from "@/components/layout/PageHeader";

<PageHeader
  title="Transactions"
  subtitle="All cash flow activity."
  action={<AppButton variantType="primary">Add</AppButton>}
/>
```

### Status Badges

Use the `bg-{color}/15 text-{color}-400 border-{color}/30` pattern for inline badges:

```tsx
<span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
  INVESTMENT
</span>
```

### Component Imports

Always import from `@/components/shared`, never from `@/components/ui` directly or Shadcn primitives.

```ts
// ❌ Forbidden
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// ✅ Required
import { AppButton } from "@/components/shared/AppButton"
import { AppCard } from "@/components/shared"
```

When a Shadcn primitive is needed for a new shared component, install it with `npx shadcn@latest add <component>` and wrap it in `components/shared/` before using it elsewhere.

---

## Colors

- Use semantic tokens consistently
- Reserve brand emerald for positive actions, confirmations, and income indicators
- Use red for expense indicators and destructive actions
- Do not rely solely on color to communicate meaning
- Ensure accessible contrast ratios

---

## Buttons & Actions

- One clear primary action per section
- Secondary actions should have less visual weight
- Dangerous/destructive actions must be visually distinct with `variantType="danger"`

---

## Forms

- Keep forms simple and scannable
- Show validation messages near the related field
- Use inline forms where possible (settings, categories) over modal-heavy patterns
- Keyboard shortcuts: Enter to confirm, Escape to cancel

---

## Data Display

- Highlight the most important numbers first (net worth, total balance)
- Financial amounts: use `formatBalance(balance, currency)` from `lib/account.utils.tsx`
- Charts: keep colored data series, update backgrounds to use `bg-background`/`bg-card`
- Tables should remain readable with consistent row padding

---

## Feedback & States

- Every mutation should produce visible feedback (optimistic UI update or toast)
- Loading states should preserve layout stability
- Empty states: centered text with `text-muted-foreground text-sm`, short guidance
- Inline confirmation for destructive actions (confirm dialog or `window.confirm`)

---

## Responsive Design

- Prevent horizontal overflow
- Single-column on mobile, grid on md+
- Touch-friendly interaction sizes (min 44px tap targets)

---

## Design Quality Checklist

Before any UI change, verify:

- [ ] **Colors** — no `text-gray-*`, `text-slate-*`, `bg-white`, `bg-gray-*`, hex literals
- [ ] **Imports** — components come from `@/components/shared`, never raw `@/components/ui`
- [ ] **Semantic tokens** — `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `border-border`
- [ ] **Brand** — emerald for positive/income; red for expense/danger
- [ ] **Behavior** — change does not break existing validation, routing, or submit logic
- [ ] **Responsive** — layout works at sm / md / lg breakpoints

### Common Behavior Pitfalls

- Changing `py-*` to `p-*` on a parent container adds unwanted horizontal padding
- Removing a wrapper div without checking that child hover/focus states still work
- Dark mode: avoid `invert` on icons that already have semantic colors
