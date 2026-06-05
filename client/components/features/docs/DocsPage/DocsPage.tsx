import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppCard } from "@/components/shared";
import { AppButton } from "@/components/shared/AppButton/AppButton";
import { ArchitectureGraph } from "@/components/features/docs/ArchitectureGraph/ArchitectureGraph";
import { ROUTES_REGISTRY } from "@/registry/routes.registry";
import { MODULES_REGISTRY } from "@/registry/modules.registry";
import { API_REGISTRY } from "@/registry/api.registry";
import { ISSUES_REGISTRY } from "@/registry/issues.registry";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { RouteDoc, ServerModuleDoc } from "@/types/registry.types";
import {
  ROADMAP,
  ROUTE_STATUS_CLASSES,
  MODULE_STATUS_CLASSES,
  SEVERITY_CLASSES,
  METHOD_CLASSES,
} from "./DocsPage.utils";
import { Badge } from "./Badge";

export const DocsPage = () => {
  const routes = Object.entries(ROUTES_REGISTRY) as Array<[string, RouteDoc]>;
  const modules = Object.entries(MODULES_REGISTRY) as Array<[string, ServerModuleDoc]>;

  const p1 = ROADMAP[0];
  const doneCount = p1.items.filter((i) => i.done).length;
  const totalCount = p1.items.length;
  const highIssues = ISSUES_REGISTRY.filter((i) => i.severity === "high").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Architecture & Docs"
        subtitle={`${routes.length} routes · ${modules.length} modules · ${API_REGISTRY.length} endpoints · ${ISSUES_REGISTRY.length} known issues`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Phase 1", value: `${doneCount}/${totalCount}`, sub: "items complete", color: "text-emerald-400" },
          { label: "Routes", value: routes.length, sub: "documented", color: "text-blue-400" },
          { label: "API endpoints", value: API_REGISTRY.length, sub: "all guarded", color: "text-purple-400" },
          { label: "Known issues", value: highIssues, sub: "high severity", color: highIssues > 0 ? "text-red-400" : "text-emerald-400" },
        ].map(({ label, value, sub, color }) => (
          <AppCard key={label} title={label} subtitle={sub}>
            <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
          </AppCard>
        ))}
      </div>

      <AppCard
        title="System Architecture"
        subtitle="Full stack from browser to database — click any layer to see details below"
        action={
          <Link href="/docs/map">
            <AppButton variantType="outline" size="sm">Caller Tree →</AppButton>
          </Link>
        }
      >
        <div className="mt-4">
          <ArchitectureGraph />
        </div>
        <p className="text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-muted/30 border border-border">
          <strong className="text-foreground">Enforcement:</strong> Every layer shown above has a corresponding registry entry in <code className="text-emerald-400">registry/modules.registry.ts</code>.
          Adding a new NestJS module without a registry entry causes a TypeScript compile error.
          Adding a new frontend route without a registry entry fails <code className="text-emerald-400">npm test</code>.
        </p>
      </AppCard>

      <div className="grid gap-6 md:grid-cols-2">
        <AppCard title="Frontend Routes" subtitle={`${routes.length} pages — registry/routes.registry.ts`}>
          <div className="space-y-2 mt-2">
            {routes.map(([path, doc]) => (
              <div key={path} className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-emerald-400 font-mono font-bold">{path}</code>
                  <Badge label={doc.status} className={ROUTE_STATUS_CLASSES[doc.status]} />
                </div>
                <p className="text-xs text-foreground font-medium">{doc.label}</p>
                <p className="text-xs text-muted-foreground leading-snug">{doc.description}</p>
                {doc.dataScope && (
                  <p className="text-[10px] text-amber-400 font-mono">Scope: {doc.dataScope}</p>
                )}
                {doc.features && doc.features.length > 0 && (
                  <ul className="space-y-0.5 mt-1">
                    {doc.features.map((f) => (
                      <li key={f} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5 shrink-0">·</span>{f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard title="Server Modules" subtitle={`${modules.length} NestJS modules — registry/modules.registry.ts`}>
          <div className="space-y-2 mt-2">
            {modules.map(([key, doc]) => (
              <div key={key} className="p-3 rounded-lg bg-muted/20 border border-border space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-emerald-400 font-mono font-bold">{key}/</code>
                  <Badge label={doc.status} className={MODULE_STATUS_CLASSES[doc.status]} />
                </div>
                <p className="text-xs text-foreground font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground leading-snug">{doc.description}</p>
                <div className="flex gap-4 text-[10px] text-muted-foreground font-mono mt-1">
                  <span>Controller: <span className="text-foreground">{doc.controller.split("/").pop()}</span></span>
                  <span>Guard: <span className="text-purple-400">{doc.guards.join(", ")}</span></span>
                </div>
                {doc.notes && (
                  <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                    ⚠ {doc.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AppCard>
      </div>

      <AppCard
        title="API Surface"
        subtitle={`${API_REGISTRY.length} endpoints — registry/api.registry.ts — all @UseGuards(AuthGuard)`}
      >
        <div className="space-y-1 mt-2">
          {API_REGISTRY.map((ep) => (
            <div
              key={`${ep.method}-${ep.path}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40"
            >
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono shrink-0 w-14 text-center ${METHOD_CLASSES[ep.method]}`}>
                {ep.method}
              </span>
              <code className="text-xs text-foreground font-mono shrink-0 hidden sm:block w-64 truncate">
                {ep.path}
              </code>
              <p className="text-xs text-muted-foreground flex-1">{ep.description}</p>
              <span className="text-[10px] text-muted-foreground shrink-0 hidden md:block font-mono">
                {ep.module}
              </span>
            </div>
          ))}
        </div>
      </AppCard>

      <AppCard title="Roadmap" subtitle="Feature status across all phases">
        <div className="space-y-6 mt-2">
          {ROADMAP.map((phase) => {
            const done = phase.items.filter((i) => i.done).length;
            const total = phase.items.length;
            return (
              <div key={phase.phase}>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm font-semibold text-foreground">{phase.phase}</p>
                  <Badge
                    label={phase.status === "in-progress" ? "in progress" : phase.status}
                    className={
                      phase.status === "in-progress"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }
                  />
                  {phase.status !== "not-started" && (
                    <span className="text-xs text-muted-foreground ml-auto">{done}/{total}</span>
                  )}
                </div>
                {phase.status !== "not-started" && (
                  <div className="w-full bg-muted rounded-full h-1.5 mb-3">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${Math.round((done / total) * 100)}%` }}
                    />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {phase.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border"
                    >
                      {item.done ? (
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      ) : phase.status === "not-started" ? (
                        <Clock size={13} className="text-muted-foreground shrink-0" />
                      ) : (
                        <AlertCircle size={13} className="text-amber-400 shrink-0" />
                      )}
                      <span className={`text-xs ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </AppCard>

      <AppCard
        title="Known Issues"
        subtitle={`${ISSUES_REGISTRY.length} open — registry/issues.registry.ts — remove entries when resolved`}
      >
        <div className="space-y-2 mt-1">
          {ISSUES_REGISTRY.map((issue) => (
            <div
              key={issue.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
            >
              <Badge label={issue.severity} className={SEVERITY_CLASSES[issue.severity]} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{issue.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{issue.description}</p>
                {issue.file && (
                  <code className="text-[10px] text-muted-foreground/70 font-mono mt-1 block">
                    {issue.file}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      </AppCard>

      <AppCard title="How the Registry System Works" subtitle="TypeScript enforcement + test coverage">
        <div className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                step: "1",
                title: "Add a new page",
                body: "Create app/(app)/new-page/page.tsx. Then add its path to AppRoutePath union in types/registry.types.ts. TypeScript immediately errors on ROUTES_REGISTRY until you add the entry.",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                step: "2",
                title: "Add a new NestJS module",
                body: "Create the module in server/src/. Add its key to ServerModuleKey in types/registry.types.ts. TypeScript errors on MODULES_REGISTRY until you document it.",
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
              {
                step: "3",
                title: "Run the test suite",
                body: "npm test runs registry-coverage.test.ts which scans the filesystem. Any page.tsx without a registry entry produces a clear error message with exact instructions to fix it.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
            ].map(({ step, title, body, color, bg }) => (
              <div key={step} className={`p-4 rounded-lg border ${bg}`}>
                <div className={`text-2xl font-black mb-2 ${color}`}>{step}</div>
                <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border font-mono text-xs space-y-1">
            <p className="text-muted-foreground">{"// types/registry.types.ts — add new routes here"}</p>
            <p className="text-foreground">{"export type AppRoutePath ="}</p>
            <p className="text-foreground ml-4">{"| '/' | '/transactions' | '/assets'"}</p>
            <p className="text-foreground ml-4">{"| '/accounts' | '/settings' | '/docs'"}</p>
            <p className="text-emerald-400 ml-4">{"| '/new-page';  ← add this line"}</p>
            <p className="text-muted-foreground mt-2">{"// registry/routes.registry.ts — TypeScript errors until this entry exists:"}</p>
            <p className="text-foreground">{"export const ROUTES_REGISTRY = {"}</p>
            <p className="text-emerald-400 ml-4">{"'/new-page': { label: '...', status: 'planned', description: '...' },"}</p>
            <p className="text-foreground">{"} satisfies Record<AppRoutePath, RouteDoc>;"}</p>
          </div>
        </div>
      </AppCard>
    </div>
  );
};
