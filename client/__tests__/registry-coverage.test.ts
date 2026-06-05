import { describe, it, expect } from "vitest";
import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { ROUTES_REGISTRY } from "../registry/routes.registry";
import { MODULES_REGISTRY } from "../registry/modules.registry";
import { API_REGISTRY } from "../registry/api.registry";
import {
  GRAPH_NODES,
  ROUTE_TO_GRAPH_NODE,
  MODULE_TO_GRAPH_NODES,
} from "../registry/graph.registry";
import type { AppRoutePath, ServerModuleKey } from "../types/registry.types";

const CLIENT_ROOT = join(__dirname, "..");
const APP_DIR = join(CLIENT_ROOT, "app/(app)");
const SERVER_ROOT = join(CLIENT_ROOT, "../server/src");
const PRISMA_SCHEMA = join(CLIENT_ROOT, "../server/prisma/schema.prisma");

// ─── Recursive page.tsx collector ────────────────────────────────────────────
// Skips Next.js route groups (e.g. (dashboard)) and private folders (_x)

const collectPageRoutes = (dir: string, routePrefix: string): Array<string> => {
  if (!existsSync(dir)) return [];
  const routes: Array<string> = [];

  if (existsSync(join(dir, "page.tsx"))) {
    routes.push(routePrefix === "" ? "/" : routePrefix);
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("(") || entry.name.startsWith("_")) continue;
    routes.push(...collectPageRoutes(join(dir, entry.name), `${routePrefix}/${entry.name}`));
  }

  return routes;
};

// ─── Route coverage ──────────────────────────────────────────────────────────

describe("Route registry coverage", () => {
  it("every page.tsx in app/(app) has a ROUTES_REGISTRY entry (recursive scan)", () => {
    const allRoutes = collectPageRoutes(APP_DIR, "");
    const missing = allRoutes.filter(r => !(r in ROUTES_REGISTRY));

    expect(
      missing,
      `\nMISSING REGISTRY ENTRIES — these routes have a page.tsx but no documentation:\n` +
        missing.map(r =>
          `  → "${r}" — add to AppRoutePath (types/registry.types.ts) and ROUTES_REGISTRY (registry/routes.registry.ts)`
        ).join("\n") + "\n"
    ).toHaveLength(0);
  });

  it("every ROUTES_REGISTRY entry has status, description, and label", () => {
    for (const [path, doc] of Object.entries(ROUTES_REGISTRY)) {
      expect(doc.label, `ROUTES_REGISTRY["${path}"] is missing label`).toBeTruthy();
      expect(doc.status, `ROUTES_REGISTRY["${path}"] is missing status`).toBeTruthy();
      expect(doc.description, `ROUTES_REGISTRY["${path}"] is missing description`).toBeTruthy();
      expect(
        doc.description.length,
        `ROUTES_REGISTRY["${path}"].description is too short (min 20 chars) — write a real description`
      ).toBeGreaterThan(20);
    }
  });
});

// ─── Server module coverage ───────────────────────────────────────────────────

describe("Server module registry coverage", () => {
  it("every NestJS module directory has a MODULES_REGISTRY entry", () => {
    if (!existsSync(SERVER_ROOT)) return;

    const dirs = readdirSync(SERVER_ROOT, { withFileTypes: true });
    const missing: Array<string> = [];

    const SKIP = new Set(["auth", "prisma", "docs"]);

    for (const entry of dirs) {
      if (!entry.isDirectory()) continue;
      if (SKIP.has(entry.name)) continue;

      const controllerGlob = existsSync(join(SERVER_ROOT, entry.name, `${entry.name}.controller.ts`));
      if (!controllerGlob) continue;

      const key = entry.name as ServerModuleKey;
      if (!(key in MODULES_REGISTRY)) {
        missing.push(entry.name);
      }
    }

    expect(
      missing,
      `\nMISSING MODULE REGISTRY ENTRIES — these NestJS modules have no documentation:\n` +
        missing.map(m =>
          `  → "${m}" — add to ServerModuleKey (types/registry.types.ts) and MODULES_REGISTRY (registry/modules.registry.ts)`
        ).join("\n") + "\n"
    ).toHaveLength(0);
  });

  it("every MODULES_REGISTRY entry has required fields", () => {
    for (const [key, doc] of Object.entries(MODULES_REGISTRY)) {
      expect(doc.name, `MODULES_REGISTRY["${key}"] is missing name`).toBeTruthy();
      expect(doc.description, `MODULES_REGISTRY["${key}"] is missing description`).toBeTruthy();
      expect(doc.status, `MODULES_REGISTRY["${key}"] is missing status`).toBeTruthy();
      expect(doc.controller, `MODULES_REGISTRY["${key}"] is missing controller path`).toBeTruthy();
      expect(doc.service, `MODULES_REGISTRY["${key}"] is missing service path`).toBeTruthy();
      expect(
        doc.description.length,
        `MODULES_REGISTRY["${key}"].description is too short — write a real description`
      ).toBeGreaterThan(30);
    }
  });
});

// ─── Prisma schema coverage ───────────────────────────────────────────────────
// Reads schema.prisma, extracts model names, verifies each has a graph node.
// Node path convention: "server/prisma/schema.prisma:ModelName"

describe("Prisma schema coverage", () => {
  it("every Prisma model has a graph node (path: schema.prisma:ModelName)", () => {
    if (!existsSync(PRISMA_SCHEMA)) return;

    const schema = readFileSync(PRISMA_SCHEMA, "utf-8");
    const modelNames = [...schema.matchAll(/^model (\w+)/gm)].map(m => m[1]);
    const missing: Array<string> = [];

    for (const model of modelNames) {
      const hasNode = GRAPH_NODES.some(n => n.path.includes(`schema.prisma:${model}`));
      if (!hasNode) missing.push(model);
    }

    expect(
      missing,
      `\nPRISMA MODELS WITH NO GRAPH NODE — add a node to GRAPH_NODES_MAP in registry/graph.registry.ts\n` +
        `  Node path must contain "server/prisma/schema.prisma:ModelName"\n` +
        missing.map(m =>
          `  → model ${m} — add GraphNodeId + node with path: "server/prisma/schema.prisma:${m}"`
        ).join("\n") + "\n"
    ).toHaveLength(0);
  });

  it("every Prisma model node has non-empty role, plain, and path", () => {
    if (!existsSync(PRISMA_SCHEMA)) return;

    const schema = readFileSync(PRISMA_SCHEMA, "utf-8");
    const modelNames = [...schema.matchAll(/^model (\w+)/gm)].map(m => m[1]);

    for (const model of modelNames) {
      const node = GRAPH_NODES.find(n => n.path.includes(`schema.prisma:${model}`));
      if (!node) continue;

      expect(node.role, `Graph node for Prisma model "${model}" is missing role`).toBeTruthy();
      expect(node.plain, `Graph node for Prisma model "${model}" is missing plain`).toBeTruthy();
    }
  });
});

// ─── Graph registry coverage ─────────────────────────────────────────────────

describe("Graph registry coverage", () => {
  it("every route in ROUTES_REGISTRY has a ROUTE_TO_GRAPH_NODE mapping", () => {
    const routeKeys = Object.keys(ROUTES_REGISTRY) as Array<AppRoutePath>;
    const graphKeys = Object.keys(ROUTE_TO_GRAPH_NODE);
    const missing = routeKeys.filter(p => !graphKeys.includes(p));
    expect(
      missing,
      `\nROUTES missing from ROUTE_TO_GRAPH_NODE in registry/graph.registry.ts:\n` +
        missing.map(p => `  → "${p}" — add it to ROUTE_TO_GRAPH_NODE`).join("\n") + "\n"
    ).toHaveLength(0);
  });

  it("every module in MODULES_REGISTRY has a MODULE_TO_GRAPH_NODES mapping", () => {
    const moduleKeys = Object.keys(MODULES_REGISTRY) as Array<ServerModuleKey>;
    const graphKeys  = Object.keys(MODULE_TO_GRAPH_NODES);
    const missing    = moduleKeys.filter(k => !graphKeys.includes(k));
    expect(
      missing,
      `\nMODULES missing from MODULE_TO_GRAPH_NODES in registry/graph.registry.ts:\n` +
        missing.map(k => `  → "${k}" — add it to MODULE_TO_GRAPH_NODES`).join("\n") + "\n"
    ).toHaveLength(0);
  });

  it("every graph node has non-empty role, plain, and path", () => {
    for (const node of GRAPH_NODES) {
      expect(
        node.role,
        `Graph node "${node.id}" is missing role — add a technical description in graph.registry.ts`
      ).toBeTruthy();
      expect(
        node.plain,
        `Graph node "${node.id}" is missing plain — add a plain-English description`
      ).toBeTruthy();
      expect(
        node.path,
        `Graph node "${node.id}" is missing path — add the source file path`
      ).toBeTruthy();
    }
  });
});

// ─── API endpoint coverage ────────────────────────────────────────────────────

describe("API registry completeness", () => {
  it("every API_REGISTRY entry has all required fields", () => {
    for (const ep of API_REGISTRY) {
      expect(ep.method, `API_REGISTRY entry "${ep.path}" is missing method`).toBeTruthy();
      expect(ep.path, "API_REGISTRY entry is missing path").toBeTruthy();
      expect(
        ep.description,
        `API_REGISTRY entry "${ep.method} ${ep.path}" is missing description`
      ).toBeTruthy();
      expect(
        ep.module,
        `API_REGISTRY entry "${ep.method} ${ep.path}" is missing module — which ServerModuleKey does this belong to?`
      ).toBeTruthy();
    }
  });

  it("every API_REGISTRY endpoint is guarded (security check)", () => {
    const unguarded = API_REGISTRY.filter((ep) => !ep.guarded);
    expect(
      unguarded,
      `\nUNGUARDED ENDPOINTS DETECTED — these endpoints have guarded: false:\n` +
        unguarded.map(ep =>
          `  → ${ep.method} ${ep.path} — is this intentionally public? If so, add a note in api.registry.ts explaining why.`
        ).join("\n") + "\n"
    ).toHaveLength(0);
  });
});
