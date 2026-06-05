// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY TYPES
//
// HOW ENFORCEMENT WORKS:
//
//   1. Add a new frontend route?
//      → Add its path to AppRoutePath (this file)
//      → Add its entry to ROUTES_REGISTRY (registry/routes.registry.ts)
//      → TypeScript will error on `satisfies Record<AppRoutePath, RouteDoc>`
//        if the entry is missing or incomplete.
//
//   2. Add a new NestJS module?
//      → Add its key to ServerModuleKey (this file)
//      → Add its entry to MODULES_REGISTRY (registry/modules.registry.ts)
//      → Same `satisfies` enforcement applies.
//
//   3. Run `npm test` — registry-coverage.test.ts scans the filesystem and
//      fails if any page.tsx exists that has no registry entry.
// ─────────────────────────────────────────────────────────────────────────────

export type RouteStatus = "done" | "partial" | "planned";
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
export type ModuleStatus = "complete" | "partial" | "stub";
export type Severity = "high" | "medium" | "low";

export interface RouteDoc {
  label: string;
  status: RouteStatus;
  description: string;
  dataScope?: string;
  features?: Array<string>;
}

export interface ApiEndpointDoc {
  method: HttpMethod;
  path: string;
  description: string;
  module: ServerModuleKey;
  guarded: boolean;
}

export interface ServerModuleDoc {
  name: string;
  description: string;
  status: ModuleStatus;
  controller: string;
  service: string;
  guards: Array<string>;
  notes?: string;
}

export interface KnownIssue {
  id: string;
  severity: Severity;
  label: string;
  description: string;
  file?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE REGISTRY KEY
//
// Add every authenticated page route here.
// Omit /sign-in and /sign-up (Clerk-managed, not app routes).
// Adding a route here without a registry entry → TypeScript error.
// Adding a page.tsx without updating this union → test failure.
// ─────────────────────────────────────────────────────────────────────────────

export type AppRoutePath =
  | "/"
  | "/transactions"
  | "/assets"
  | "/accounts"
  | "/settings"
  | "/docs";

// ─────────────────────────────────────────────────────────────────────────────
// SERVER MODULE REGISTRY KEY
//
// Add every NestJS module here.
// Adding a key here without a registry entry → TypeScript error.
// ─────────────────────────────────────────────────────────────────────────────

export type ServerModuleKey =
  | "accounts"
  | "transactions"
  | "categories"
  | "category-rules";
