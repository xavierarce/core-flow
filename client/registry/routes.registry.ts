import type { AppRoutePath, RouteDoc } from "@/types/registry.types";

// `satisfies` enforces two-way completeness:
//   - Every AppRoutePath key MUST have an entry here.
//   - Every value MUST match RouteDoc (all required fields present).
//   - Extra keys not in AppRoutePath → TypeScript error.
//
// To add a new route:
//   1. Add its path to AppRoutePath in types/registry.types.ts
//   2. Add the entry below — TypeScript will highlight exactly what's missing.

export const ROUTES_REGISTRY = {
  "/": {
    label: "Dashboard",
    status: "done",
    description:
      "Overview of the user's complete financial picture. Shows net worth across all account types, 6-month cash flow trend, expense breakdown by category, and recent transaction activity.",
    features: [
      "Net worth calculation (all account types)",
      "Cash flow bar chart (6-month, income vs. expense)",
      "Expense breakdown pie chart (by category)",
      "Recent transactions list (CASH + SAVINGS accounts)",
      "Month navigation via URL search params",
    ],
  },
  "/transactions": {
    label: "Transactions",
    status: "done",
    description:
      "Full transaction ledger scoped to CASH and SAVINGS accounts only. Supports manual entry, CSV drag-and-drop import, inline category assignment, and search + month filtering.",
    dataScope: "CASH, SAVINGS accounts only",
    features: [
      "Manual transaction entry via dialog",
      "CSV import with drag-and-drop (French + English bank formats)",
      "Inline category re-assignment with auto-rule learning",
      "Search by description, amount, or category",
      "Month filter via URL search params",
      "Pagination (show more, +20 per click)",
      "Delete MANUAL transactions only",
    ],
  },
  "/assets": {
    label: "Wealth",
    status: "done",
    description:
      "Portfolio view scoped to investment-type accounts (INVESTMENT, TRADING, CRYPTO, REAL_ESTATE). Shows asset allocation pie chart, per-account balances, and account type grouping.",
    dataScope: "INVESTMENT, TRADING, CRYPTO, REAL_ESTATE accounts only",
    features: [
      "Asset allocation pie chart",
      "Per-type grouping with net totals",
      "Balance and percentage breakdown per account",
      "Account type badge labels",
    ],
  },
  "/accounts": {
    label: "Accounts",
    status: "done",
    description:
      "Manage all financial accounts across all account types. Create new accounts with initial balance, edit name and institution, delete accounts (cascades all transactions).",
    features: [
      "Create account with initial balance (creates seed transaction)",
      "Edit name, institution, and account type",
      "Delete account (cascades all transactions, confirms before delete)",
      "Account type icons and balance display",
      "Total balance summary per type",
    ],
  },
  "/settings": {
    label: "Settings",
    status: "partial",
    description:
      "User preferences and categorisation management. Category CRUD with color picker and income/expense toggle. Category rules list with delete. Currency preference and data export not yet implemented.",
    features: [
      "Category create / edit / delete (inline, no dialog)",
      "Preset color picker (12 swatches)",
      "Income / Expense type toggle per category",
      "Category rules list (keyword → category mappings)",
      "Delete individual rules",
    ],
  },
  "/docs": {
    label: "Docs",
    status: "done",
    description:
      "Private in-app architecture reference. Shows tech stack, route map, data model, full API surface, component architecture rules, roadmap, and known issues. This page. Auto-updates via registry system.",
    features: [
      "Architecture graph (layered system diagram)",
      "Typed route registry (TypeScript enforced)",
      "Typed API endpoint registry",
      "Server module registry",
      "Roadmap with phase tracking",
      "Known issues tracker",
    ],
  },
  "/docs/map": {
    label: "Architecture Map",
    status: "done",
    description:
      "Interactive SVG graph of the full system architecture. Pan, zoom, and click any node to see its role, source path, notes, edges, and known bugs. Backed by a typed registry — adding a route or module without updating the graph causes a TypeScript error.",
    features: [
      "Pan and zoom SVG canvas (drag + scroll wheel)",
      "Click node to open sidebar with role, plain-English description, source path, notes",
      "Filter by feature area (Overview, Transactions, Auth, Data, etc.)",
      "Critical path filter highlights the core transaction flow",
      "Incoming and outgoing edge lists in the sidebar",
      "Bug and fix count badges from issues registry",
      "TypeScript-enforced graph completeness — every route and module must map to a graph node",
    ],
  },
} satisfies Record<AppRoutePath, RouteDoc>;
