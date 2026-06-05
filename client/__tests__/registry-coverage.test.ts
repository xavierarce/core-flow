import { describe, it, expect } from "vitest";
import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { ROUTES_REGISTRY } from "../registry/routes.registry";
import { MODULES_REGISTRY } from "../registry/modules.registry";
import { API_REGISTRY } from "../registry/api.registry";
import type { AppRoutePath, ServerModuleKey } from "../types/registry.types";

const CLIENT_ROOT = join(__dirname, "..");
const APP_DIR = join(CLIENT_ROOT, "app/(app)");
const SERVER_ROOT = join(CLIENT_ROOT, "../server/src");

// ─── Route coverage ──────────────────────────────────────────────────────────

describe("Route registry coverage", () => {
  it("every page.tsx in app/(app) has a ROUTES_REGISTRY entry", () => {
    if (!existsSync(APP_DIR)) return;

    const dirs = readdirSync(APP_DIR, { withFileTypes: true });
    const missing: Array<string> = [];

    // Root route (app/(app)/page.tsx)
    if (existsSync(join(APP_DIR, "page.tsx")) && !("/" in ROUTES_REGISTRY)) {
      missing.push("/");
    }

    // Sub-routes (app/(app)/[name]/page.tsx)
    for (const entry of dirs) {
      if (!entry.isDirectory()) continue;
      const pagePath = join(APP_DIR, entry.name, "page.tsx");
      if (!existsSync(pagePath)) continue;
      const route = `/${entry.name}` as AppRoutePath;
      if (!(route in ROUTES_REGISTRY)) {
        missing.push(route);
      }
    }

    expect(
      missing,
      `\nMISSING REGISTRY ENTRIES — these routes have a page.tsx but no documentation:\n` +
        missing.map((r) => `  → "${r}" — add to AppRoutePath (types/registry.types.ts) and ROUTES_REGISTRY (registry/routes.registry.ts)`).join("\n") +
        "\n"
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

    const SKIP = new Set(["auth", "prisma", "docs"]); // infrastructure modules, not business modules

    for (const entry of dirs) {
      if (!entry.isDirectory()) continue;
      if (SKIP.has(entry.name)) continue;

      const controllerGlob = existsSync(join(SERVER_ROOT, entry.name, `${entry.name}.controller.ts`));
      if (!controllerGlob) continue; // not a module dir

      const key = entry.name as ServerModuleKey;
      if (!(key in MODULES_REGISTRY)) {
        missing.push(entry.name);
      }
    }

    expect(
      missing,
      `\nMISSING MODULE REGISTRY ENTRIES — these NestJS modules have no documentation:\n` +
        missing.map((m) => `  → "${m}" — add to ServerModuleKey (types/registry.types.ts) and MODULES_REGISTRY (registry/modules.registry.ts)`).join("\n") +
        "\n"
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
        unguarded.map((ep) => `  → ${ep.method} ${ep.path} — is this intentionally public? If so, add a note in api.registry.ts explaining why.`).join("\n") +
        "\n"
    ).toHaveLength(0);
  });
});
