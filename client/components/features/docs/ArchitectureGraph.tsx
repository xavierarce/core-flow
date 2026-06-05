"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LayerNode {
  label: string;
  detail?: string;
  color?: string;
}

interface Layer {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  nodes: Array<LayerNode>;
}

const LAYERS: Array<Layer> = [
  {
    id: "browser",
    title: "Browser",
    subtitle: "User interface layer",
    color: "#3b82f6",
    textColor: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    nodes: [
      { label: "React 19", detail: "component runtime" },
      { label: "Tailwind v4", detail: "design system" },
      { label: "Recharts", detail: "data visualisation" },
      { label: "next-themes", detail: "dark / light mode" },
      { label: "Sonner", detail: "toast feedback" },
    ],
  },
  {
    id: "nextjs",
    title: "Next.js 16 App Router",
    subtitle: "Frontend framework — (app)/ route group",
    color: "#8b5cf6",
    textColor: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    nodes: [
      { label: "Server Components", detail: "auth() + data fetch → props" },
      { label: "Client Components", detail: "useAuth() + mutations" },
      { label: "Route group (app)", detail: "Navbar + shell layout" },
      {
        label: "Page server components",
        detail:
          "6 routes: /, /transactions, /assets, /accounts, /settings, /docs",
      },
    ],
  },
  {
    id: "auth",
    title: "Clerk Auth",
    subtitle: "JWT identity layer",
    color: "#f59e0b",
    textColor: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    nodes: [
      { label: "auth()", detail: "server-side token extraction" },
      { label: "useAuth()", detail: "client-side token hook" },
      { label: "Middleware", detail: "protects all (app)/* routes" },
      { label: "UserButton", detail: "avatar + sign-out" },
    ],
  },
  {
    id: "services",
    title: "Service Layer",
    subtitle: "client/services/ — token-first API clients",
    color: "#10b981",
    textColor: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    nodes: [
      { label: "AccountsService" },
      { label: "TransactionsService" },
      { label: "CategoriesService" },
      { label: "CategoryRulesService" },
    ],
  },
  {
    id: "nestjs",
    title: "NestJS v11 API",
    subtitle: "server/src/ — port 3000, every controller @UseGuards(AuthGuard)",
    color: "#ef4444",
    textColor: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    nodes: [
      { label: "accounts/", detail: "full CRUD + balance reconciliation" },
      { label: "transactions/", detail: "CRUD + CSV bulk import" },
      { label: "categories/", detail: "full CRUD, seeded on signup" },
      { label: "category-rules/", detail: "keyword → auto-assign" },
      { label: "auth/", detail: "AuthGuard + @CurrentUser() decorator" },
    ],
  },
  {
    id: "prisma",
    title: "Prisma v7 ORM",
    subtitle: "Type-safe query builder — all queries scoped by userId",
    color: "#06b6d4",
    textColor: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
    nodes: [
      { label: "User", detail: "Clerk ID, email, timestamps" },
      { label: "Account", detail: "type, balance, currency, isAutomated" },
      { label: "Transaction", detail: "amount, date, source, isRecurring" },
      { label: "Category", detail: "name, type, color, icon" },
      {
        label: "CategoryRule",
        detail: "keyword → category, unique(keyword,userId)",
      },
    ],
  },
  {
    id: "postgres",
    title: "PostgreSQL 15",
    subtitle: "Primary database — all data isolated per userId",
    color: "#a855f7",
    textColor: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    nodes: [
      {
        label: "Cascading deletes",
        detail: "account delete → all transactions deleted",
      },
      {
        label: "Unique constraints",
        detail: "(keyword, userId), (name, userId)",
      },
      { label: "Foreign keys", detail: "all models reference User.id" },
    ],
  },
];

const Arrow = ({ color }: { color: string }) => (
  <div className="flex justify-center items-center py-1">
    <div className="flex flex-col items-center gap-0">
      <div
        className="w-px h-5"
        style={{ backgroundColor: color, opacity: 0.4 }}
      />
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M5 6L0 0H10L5 6Z" fill={color} fillOpacity={0.4} />
      </svg>
    </div>
  </div>
);

export const ArchitectureGraph = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted)
    return <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-0">
      {LAYERS.map((layer, i) => (
        <div key={layer.id}>
          <div
            className={`rounded-xl border p-4 ${layer.bgClass} ${layer.borderClass}`}
          >
            {/* Layer header */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className={`text-sm font-bold ${layer.textColor}`}>
                {layer.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {layer.subtitle}
              </span>
            </div>

            {/* Nodes */}
            <div className="flex flex-wrap gap-2">
              {layer.nodes.map((node) => (
                <div
                  key={node.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs"
                  style={{
                    backgroundColor: isDark
                      ? `${layer.color}18`
                      : `${layer.color}12`,
                    borderColor: `${layer.color}35`,
                  }}
                >
                  <span className="font-medium text-foreground">
                    {node.label}
                  </span>
                  {node.detail && (
                    <span className="text-muted-foreground hidden sm:inline">
                      — {node.detail}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {i < LAYERS.length - 1 && <Arrow color={LAYERS[i + 1].color} />}
        </div>
      ))}
    </div>
  );
};
