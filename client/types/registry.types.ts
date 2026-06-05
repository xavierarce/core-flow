// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY TYPES
//
// HOW ENFORCEMENT WORKS:
//
//   1. Add a new frontend route?
//      → Add its path to AppRoutePath (this file)
//      → Add its entry to ROUTES_REGISTRY (registry/routes.registry.ts)
//      → Add its graph node to GraphNodeId + GRAPH_NODES_MAP (registry/graph.registry.ts)
//      → Add its mapping to ROUTE_TO_GRAPH_NODE (registry/graph.registry.ts)
//      → TypeScript errors on every satisfies check until all four are done.
//
//   2. Add a new NestJS module?
//      → Add its key to ServerModuleKey (this file)
//      → Add its entry to MODULES_REGISTRY (registry/modules.registry.ts)
//      → Add controller + service graph nodes to GraphNodeId + GRAPH_NODES_MAP
//      → Add its mapping to MODULE_TO_GRAPH_NODES (registry/graph.registry.ts)
//
//   3. Run `npm test` — registry-coverage.test.ts scans the filesystem and
//      fails if any page.tsx or controller exists without a registry entry.
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
// ─────────────────────────────────────────────────────────────────────────────

export type AppRoutePath =
  | "/"
  | "/transactions"
  | "/assets"
  | "/accounts"
  | "/settings"
  | "/docs"
  | "/docs/map";

// ─────────────────────────────────────────────────────────────────────────────
// SERVER MODULE REGISTRY KEY
// ─────────────────────────────────────────────────────────────────────────────

export type ServerModuleKey =
  | "accounts"
  | "transactions"
  | "categories"
  | "category-rules";

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH TYPES
// ─────────────────────────────────────────────────────────────────────────────

// Every significant node in the architecture map. Adding a route or module
// without a corresponding graph node id → TypeScript error downstream.
export type GraphNodeId =
  // Entry cluster
  | "entry-layout"
  | "entry-theme"
  | "entry-middleware"
  | "entry-navbar"
  // Route cluster — one per AppRoutePath (except /docs/map which is meta)
  | "route-dashboard"
  | "route-transactions"
  | "route-assets"
  | "route-accounts"
  | "route-settings"
  | "route-docs"
  | "route-docs-map"
  // Component cluster
  | "comp-add-transaction"
  | "comp-manage-account"
  | "comp-csv-importer"
  | "comp-transaction-row"
  | "comp-charts"
  // Client service cluster
  | "svc-accounts"
  | "svc-transactions"
  | "svc-categories"
  | "svc-rules"
  // NestJS API cluster
  | "api-guard"
  | "api-accounts"
  | "api-transactions"
  | "api-categories"
  | "api-rules"
  // Server service cluster
  | "server-accounts"
  | "server-transactions"
  | "server-categories"
  | "server-rules"
  // Data cluster
  | "data-prisma"
  | "data-user"
  | "data-account"
  | "data-transaction"
  | "data-category"
  | "data-rule"
  // External cluster
  | "ext-clerk"
  | "ext-postgres";

export type GraphClusterId =
  | "entry"
  | "routes"
  | "components"
  | "services"
  | "api"
  | "server-services"
  | "data"
  | "external";

export type GraphNodeColor =
  | "client"
  | "route"
  | "service"
  | "db"
  | "external"
  | "critical";

export type GraphEdgeKind = "critical" | "api" | "db" | "mount" | "normal";

export interface GraphNode {
  id: GraphNodeId;
  cluster: GraphClusterId;
  label: string;
  sub: string;
  color: GraphNodeColor;
  role: string;
  plain: string;
  path: string;
  notes: Array<string>;
  tag: Array<string>;
  critical?: boolean;
}

export interface GraphEdge {
  from: GraphNodeId;
  to: GraphNodeId;
  kind: GraphEdgeKind;
  label: string;
  tag: Array<string>;
}

export interface GraphFix {
  n: number;
  t: string;
}

export interface GraphBug {
  sev: Severity;
  ref: string;
  t: string;
}
