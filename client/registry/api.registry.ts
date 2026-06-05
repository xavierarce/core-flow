import type { ApiEndpointDoc } from "@/types/registry.types";

// All API endpoints. Every entry must have all ApiEndpointDoc fields.
// Add an entry here whenever a new endpoint is added to the NestJS backend.
//
// Note: all endpoints are guarded (guarded: true). If a public endpoint is
// ever added, set guarded: false and add a note explaining why.

export const API_REGISTRY: Array<ApiEndpointDoc> = [
  {
    method: "GET",
    path: "/accounts",
    description: "All accounts for the authenticated user",
    module: "accounts",
    guarded: true,
  },
  {
    method: "POST",
    path: "/accounts",
    description: "Create account + seed initial balance transaction",
    module: "accounts",
    guarded: true,
  },
  {
    method: "PATCH",
    path: "/accounts/:id",
    description: "Update account name, institution, or type",
    module: "accounts",
    guarded: true,
  },
  {
    method: "DELETE",
    path: "/accounts/:id",
    description: "Delete account and cascade all its transactions",
    module: "accounts",
    guarded: true,
  },
  {
    method: "GET",
    path: "/transactions",
    description: "All transactions for the authenticated user (optionally filtered by accountId)",
    module: "transactions",
    guarded: true,
  },
  {
    method: "POST",
    path: "/transactions",
    description: "Create transaction and adjust parent account balance",
    module: "transactions",
    guarded: true,
  },
  {
    method: "PATCH",
    path: "/transactions/:id",
    description: "Update transaction fields (note: amount changes do NOT reconcile balance — known bug)",
    module: "transactions",
    guarded: true,
  },
  {
    method: "DELETE",
    path: "/transactions/:id",
    description: "Delete MANUAL-source transaction and reconcile account balance",
    module: "transactions",
    guarded: true,
  },
  {
    method: "POST",
    path: "/transactions/:accountId/import",
    description: "Bulk CSV import with auto-categorisation via category rules",
    module: "transactions",
    guarded: true,
  },
  {
    method: "GET",
    path: "/categories",
    description: "All categories for the authenticated user",
    module: "categories",
    guarded: true,
  },
  {
    method: "POST",
    path: "/categories",
    description: "Create category (name, type: INCOME|EXPENSE, color: hex)",
    module: "categories",
    guarded: true,
  },
  {
    method: "PATCH",
    path: "/categories/:id",
    description: "Update category name, type, or color",
    module: "categories",
    guarded: true,
  },
  {
    method: "DELETE",
    path: "/categories/:id",
    description: "Delete category (transactions become uncategorized)",
    module: "categories",
    guarded: true,
  },
  {
    method: "GET",
    path: "/category-rules",
    description: "All keyword → category rules for the authenticated user",
    module: "category-rules",
    guarded: true,
  },
  {
    method: "POST",
    path: "/category-rules",
    description: "Create keyword→category rule (auto-created on inline re-categorisation)",
    module: "category-rules",
    guarded: true,
  },
  {
    method: "DELETE",
    path: "/category-rules/:id",
    description: "Delete a category rule",
    module: "category-rules",
    guarded: true,
  },
];
