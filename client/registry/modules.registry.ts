import type { ServerModuleKey, ServerModuleDoc } from "@/types/registry.types";

// `satisfies` enforces that every ServerModuleKey has a complete entry.
//
// To add a new NestJS module:
//   1. Add its key to ServerModuleKey in types/registry.types.ts
//   2. Add the entry below — TypeScript will highlight missing fields.

export const MODULES_REGISTRY = {
  "accounts": {
    name: "Accounts",
    description:
      "Manages all financial accounts. Creating an account also creates an initial balance transaction. Deleting an account cascades to all its transactions. Balance is kept in sync on every transaction mutation.",
    status: "complete",
    controller: "server/src/accounts/accounts.controller.ts",
    service: "server/src/accounts/accounts.service.ts",
    guards: ["AuthGuard"],
    notes: "TRADING account type is supported in schema but missing from the frontend create dialog.",
  },
  "transactions": {
    name: "Transactions",
    description:
      "Full transaction CRUD plus bulk CSV import. Deletion is restricted to MANUAL-source transactions (BANK and CSV sources are protected). Each mutation reconciles the parent account balance. The update() method currently silently drops amount changes — known bug.",
    status: "partial",
    controller: "server/src/transactions/transactions.controller.ts",
    service: "server/src/transactions/transactions.service.ts",
    guards: ["AuthGuard"],
    notes:
      "KNOWN BUG: update() destructures amount but never uses it to reconcile account balance. Amount edits via API leave the account balance stale.",
  },
  "categories": {
    name: "Categories",
    description:
      "User-defined category labels with INCOME/EXPENSE type and hex color. Unique per (name, userId). On first authenticated request, 9 default categories are seeded automatically by the auth guard via user creation.",
    status: "complete",
    controller: "server/src/categories/categories.controller.ts",
    service: "server/src/categories/categories.service.ts",
    guards: ["AuthGuard"],
  },
  "category-rules": {
    name: "Category Rules",
    description:
      "Keyword → category auto-assignment rules. Unique per (keyword, userId). Auto-learned when a user re-categorises a transaction inline on the transactions page. Applied during CSV import to auto-assign categories.",
    status: "complete",
    controller: "server/src/category-rules/category-rules.controller.ts",
    service: "server/src/category-rules/category-rules.service.ts",
    guards: ["AuthGuard"],
  },
} satisfies Record<ServerModuleKey, ServerModuleDoc>;
