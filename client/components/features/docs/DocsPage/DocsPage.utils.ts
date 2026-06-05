import type { RouteStatus, ModuleStatus, Severity, HttpMethod } from "@/types/registry.types";

export const ROADMAP = [
  {
    phase: "Phase 1 — Foundation",
    status: "in-progress" as const,
    items: [
      { label: "Accounts CRUD", done: true },
      { label: "Transactions CRUD + CSV import", done: true },
      { label: "Dashboard widgets (net worth, cash flow, expense)", done: true },
      { label: "Category CRUD", done: true },
      { label: "Category rules (auto-learn on re-categorise)", done: true },
      { label: "Dark / light theme with semantic tokens", done: true },
      { label: "Toast feedback on all mutations", done: true },
      { label: "Mobile navigation", done: true },
      { label: "Data scoping (Transactions=CASH, Wealth=INVESTMENT)", done: true },
      { label: "In-app docs page with typed registry", done: true },
      { label: "Transaction editing (amount, description, date)", done: false },
      { label: "TRADING account type in create dialog", done: false },
      { label: "Currency preference in Settings", done: false },
      { label: "Data export (CSV / JSON)", done: false },
      { label: "Error boundaries + skeleton loaders", done: false },
      { label: "CORS via env var (not hardcoded localhost)", done: false },
    ],
  },
  {
    phase: "Phase 2 — Wealth Engine",
    status: "not-started" as const,
    items: [
      { label: "Asset table (symbol, quantity, account)", done: false },
      { label: "CoinGecko / Yahoo Finance live pricing", done: false },
      { label: "Auto-calc: price × quantity → account balance", done: false },
      { label: "Per-asset performance view", done: false },
      { label: "Historical balance snapshots", done: false },
    ],
  },
  {
    phase: "Phase 3 — Automation",
    status: "not-started" as const,
    items: [
      { label: "GoCardless / Plaid bank sync", done: false },
      { label: "Recurring transaction engine (cron)", done: false },
      { label: "Public crypto wallet watch (on-chain sync)", done: false },
      { label: "Clerk webhook → real user email sync", done: false },
    ],
  },
];

export const ROUTE_STATUS_CLASSES: Record<RouteStatus, string> = {
  done:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  planned: "bg-muted text-muted-foreground border-border",
};

export const MODULE_STATUS_CLASSES: Record<ModuleStatus, string> = {
  complete: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  partial:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  stub:     "bg-red-500/15 text-red-400 border-red-500/30",
};

export const SEVERITY_CLASSES: Record<Severity, string> = {
  high:   "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low:    "bg-muted text-muted-foreground border-border",
};

export const METHOD_CLASSES: Record<HttpMethod, string> = {
  GET:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  POST:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PATCH:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};
