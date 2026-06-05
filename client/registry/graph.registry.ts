import type {
  GraphNode, GraphNodeId, GraphClusterId,
  GraphNodeColor, GraphEdge, GraphFix, GraphBug,
  AppRoutePath, ServerModuleKey,
} from "@/types/registry.types";

// ─── Node constructor ──────────────────────────────────────────────────────────

const N = (
  id: GraphNodeId,
  cluster: GraphClusterId,
  label: string,
  sub: string,
  color: GraphNodeColor,
  opts: Partial<Omit<GraphNode, "id" | "cluster" | "label" | "sub" | "color">> = {}
): GraphNode => ({
  id, cluster, label, sub, color,
  role: "", plain: "", path: "", notes: [], tag: ["all"],
  ...opts,
});

// ─── Nodes ────────────────────────────────────────────────────────────────────
// `satisfies Record<GraphNodeId, GraphNode>` ensures:
//   - Every GraphNodeId has an entry
//   - Every entry matches the GraphNode interface
//   - No phantom IDs that don't exist in GraphNodeId

export const GRAPH_NODES_MAP: Record<GraphNodeId, GraphNode> = {

  // ── Entry ──────────────────────────────────────────────────────────────────
  "entry-layout": N("entry-layout", "entry", "layout.tsx", "root layout", "client", {
      role: "Root Next.js layout — wraps all pages in ClerkProvider + ThemeProvider.",
      plain: "The outermost shell of the app. Every page on the site goes through this. It sets up authentication and the dark/light theme for all child pages.",
      path: "client/app/layout.tsx",
      notes: ["line:7, ClerkProvider wraps entire tree", "line:8, ThemeProvider from components/providers/", "line:24, Toaster (sonner) placed here — receives all toast events"],
      tag: ["all", "overview"],
    }),

  "entry-theme": N("entry-theme", "entry", "ThemeProvider", "next-themes wrapper", "client", {
      role: "Thin wrapper around next-themes Provider, defaultTheme='dark'.",
      plain: "Controls whether the app is dark or light. Sets 'dark' as the default and lets users toggle.",
      path: "client/components/providers/ThemeProvider.tsx",
      notes: ["line:6, defaultTheme='dark'", "attribute='class' — adds .dark class to <html>", "next-themes reads CSS .dark vars from globals.css"],
      tag: ["all", "overview"],
    }),

  "entry-middleware": N("entry-middleware", "entry", "middleware.ts", "Clerk route guard", "client", {
      role: "Next.js middleware that redirects unauthenticated users to /sign-in for all (app)/* routes.",
      plain: "The doorman. If you're not signed in, you can't access any page — you get redirected to sign in. Only /sign-in and /sign-up are public.",
      path: "client/middleware.ts",
      notes: ["line:1, clerkMiddleware from @clerk/nextjs/server", "publicRoutes: [\"/sign-in\", \"/sign-up\"]", "Everything else requires auth token"],
      tag: ["all", "overview", "auth"],
    }),

  "entry-navbar": N("entry-navbar", "entry", "Navbar", "top navigation", "client", {
      role: "Sticky top nav with brand, route links, ThemeToggle, settings icon, and Clerk UserButton. Mobile: Sheet drawer.",
      plain: "The navigation bar at the top of every page. Has links to all sections, a dark/light toggle button, and your profile picture. On phones, the links collapse into a slide-out menu.",
      path: "client/components/shared/Navbar/Navbar.tsx",
      notes: ["line:22, sticky top-0 z-50", "line:100, mobile Sheet from @/components/ui/sheet", "NAV_LINKS from Navbar.utils.ts — add new routes there"],
      tag: ["all", "overview"],
    }),

  // ── Routes ─────────────────────────────────────────────────────────────────
  "route-dashboard": N("route-dashboard", "routes", "/ Dashboard", "server component", "route", {
      role: "Server component. Fetches accounts + transactions for current month, calculates net worth and cash flow, passes to widgets.",
      plain: "Your home screen. Shows your total wealth, how much you spent vs. earned this month, a chart of the last 6 months, and your recent transactions.",
      path: "client/app/(app)/page.tsx",
      notes: ["line:19, auth() + getToken()", "Filters CASH/SAVINGS accounts for cash flow", "calculateMonthlyCashFlow from lib/finance.utils.ts", "MonthFilter uses URL ?date= param"],
      tag: ["all", "overview", "dashboard"],
    }),

  "route-transactions": N("route-transactions", "routes", "/transactions", "server component", "route", {
      role: "Server component. Scoped to CASH+SAVINGS accounts. Renders transaction list with search, month filter, and pagination.",
      plain: "Your spending/income ledger — shows every transaction in your bank and savings accounts. You can search, filter by month, add new ones, or import from a CSV file.",
      path: "client/app/(app)/transactions/page.tsx",
      notes: ["line:25, filters accounts to CASH|SAVINGS only", "Search/filter via URL ?search= ?categoryId= params", "Pagination: ?limit= increments by 20"],
      tag: ["all", "overview", "transactions"],
      critical: true,
    }),

  "route-assets": N("route-assets", "routes", "/assets", "server component", "route", {
      role: "Server component. Scoped to INVESTMENT/TRADING/CRYPTO/REAL_ESTATE accounts. Shows portfolio allocation.",
      plain: "Your investment portfolio — shows all your stocks, crypto, and property holdings with how they're distributed by type.",
      path: "client/app/(app)/assets/page.tsx",
      notes: ["Filters accounts to investment types only", "WealthChart shows current allocation", "No live pricing yet — Phase 2 item"],
      tag: ["all", "overview", "wealth"],
    }),

  "route-accounts": N("route-accounts", "routes", "/accounts", "server component", "route", {
      role: "Server component. Lists all accounts across all types. Passes to AccountCard + ManageAccountDialog.",
      plain: "Manage all your financial accounts — create new ones, edit names, or delete them (which also deletes all their transactions).",
      path: "client/app/(app)/accounts/page.tsx",
      notes: ["All account types shown here (no scoping)", "AccountCard renders each row", "ManageAccountDialog handles create/edit/delete"],
      tag: ["all", "overview", "accounts"],
    }),

  "route-settings": N("route-settings", "routes", "/settings", "server component", "route", {
      role: "Server component. Fetches categories + rules, renders CategoryManager + RulesList.",
      plain: "Your settings page — manage how transactions get categorized (like tagging 'Starbucks' as 'Coffee') and what rules automatically do that for you.",
      path: "client/app/(app)/settings/page.tsx",
      notes: ["CategoryManager is a client component for inline editing", "RulesList shows auto-learned keyword→category mappings", "Currency preference and export not yet implemented"],
      tag: ["all", "overview", "settings"],
    }),

  "route-docs": N("route-docs", "routes", "/docs", "server component", "route", {
      role: "Server component. Renders the registry-driven docs page — routes, modules, API surface, roadmap, known issues.",
      plain: "This internal documentation hub. It automatically stays up to date because it reads from typed registries — if you add a new feature, you're forced to document it.",
      path: "client/app/(app)/docs/page.tsx",
      notes: ["Imports from registry/ — all data is typed", "No hardcoded content — all from registries", "satisfies checks enforce completeness"],
      tag: ["all", "overview", "docs"],
    }),

  "route-docs-map": N("route-docs-map", "routes", "/docs/map", "client component", "route", {
      role: "Client component page wrapping the interactive ArchitectureMap SVG canvas.",
      plain: "The interactive map you're looking at right now. Shows the entire app as a visual graph — zoom in, click nodes to see details, filter by feature.",
      path: "client/app/(app)/docs/map/page.tsx",
      notes: ["Full client component — uses pan/zoom state", "Data from registry/graph.registry.ts", "Adding new routes/modules without updating graph → TypeScript error"],
      tag: ["all", "overview", "docs"],
    }),

  // ── Components ─────────────────────────────────────────────────────────────
  "comp-add-transaction": N("comp-add-transaction", "components", "AddTransaction\nDialog", "form dialog", "client", {
      role: "Dialog with React Hook Form + Zod. Submits to TransactionsService.create(). On success: closes, resets form, router.refresh().",
      plain: "The popup form you use to manually add a new transaction. Has fields for description, amount, category, account, date, and whether it repeats monthly.",
      path: "client/components/shared/AddTransactionDialog/AddTransactionDialog.tsx",
      notes: ["useAddTransactionDialog hook owns all state", "formSchema in AddTransactionDialog.utils.ts", "toast.success on save, toast.error on failure"],
      tag: ["all", "transactions", "overview"],
      critical: true,
    }),

  "comp-manage-account": N("comp-manage-account", "components", "ManageAccount\nDialog", "form dialog", "client", {
      role: "Create/edit/delete dialog for Account entities. Handles both create (with initialBalance) and edit modes from the same form.",
      plain: "The popup you use to create or edit an account — name, bank, account type, and starting balance. Also has a delete button that removes the account and all its transactions.",
      path: "client/components/shared/ManageAccountDialog/ManageAccountDialog.tsx",
      notes: ["isEditing = !!account prop", "Delete: window.confirm then AccountsService.delete", "TRADING type missing from select — known issue"],
      tag: ["all", "accounts"],
    }),

  "comp-csv-importer": N("comp-csv-importer", "components", "CsvImporter", "drag-and-drop", "client", {
      role: "Dropzone that accepts .csv files, auto-detects French/English bank formats, previews parsed rows, and POSTs to /transactions/:accountId/import.",
      plain: "Drag a CSV bank export here and it figures out the format, shows you a preview of what will be imported, then sends everything to the server in one go.",
      path: "client/components/shared/CsvImporter/CsvImporter.tsx",
      notes: ["line:40, headerIndex detection by 'date'|'Date de' prefix", "PapaParse with semicolon delimiter", "parseRows in CsvImporter.utils.ts maps raw CSV to ParsedTransaction"],
      tag: ["all", "transactions"],
    }),

  "comp-transaction-row": N("comp-transaction-row", "components", "TransactionRow", "list item", "client", {
      role: "Single transaction row with inline category select. On change: calls CategoryRulesService.create() to auto-learn the rule, then router.refresh().",
      plain: "Each row in the transactions list. You can click the category badge to change it — when you do, it remembers that rule for next time.",
      path: "client/components/shared/TransactionRow/TransactionRow.tsx",
      notes: ["Inline category change → auto-creates CategoryRule", "Delete only appears for source=MANUAL transactions", "SUB badge for isRecurring=true"],
      tag: ["all", "transactions"],
    }),

  "comp-charts": N("comp-charts", "components", "Charts", "Recharts wrappers", "client", {
      role: "WealthChart (pie), CashFlowChart (bar), ExpenseChart (donut) — all dark-mode aware via useTheme().",
      plain: "The three chart types used on the dashboard and wealth pages. They automatically adjust their colors when you switch between dark and light mode.",
      path: "client/components/shared/WealthChart/WealthChart.tsx",
      notes: ["useTheme() resolves dark/light at runtime", "Tooltip/grid colors computed from resolvedTheme", "CHART_COLORS in WealthChart.utils.ts"],
      tag: ["all", "dashboard", "wealth"],
    }),

  // ── Client Services ─────────────────────────────────────────────────────────
  "svc-accounts": N("svc-accounts", "services", "AccountsService", "client", "service", {
      role: "Plain object with getAll/create/update/delete — each method calls NEXT_PUBLIC_API_URL with a Bearer token.",
      plain: "The client-side code that talks to the accounts API. Every function takes your auth token and the data to send.",
      path: "client/services/accounts.service.ts",
      notes: ["Token-first signature: getAll(token)", "No state — pure async functions", "Throws on non-2xx response"],
      tag: ["all", "accounts"],
    }),

  "svc-transactions": N("svc-transactions", "services", "TransactionsService", "client", "service", {
      role: "getAll/create/delete/import — wraps REST calls to /transactions and /transactions/:id/import.",
      plain: "The client-side code that talks to the transactions API — fetching your history, adding new transactions, and deleting them.",
      path: "client/services/transactions.service.ts",
      notes: ["create() used by AddTransactionDialog on the critical path", "import() POSTs a JSON array to /transactions/:id/import", "No update() — transaction editing is a TODO"],
      tag: ["all", "transactions"],
      critical: true,
    }),

  "svc-categories": N("svc-categories", "services", "CategoriesService", "client", "service", {
      role: "getAll/create/update/delete — plain REST client for the /categories resource.",
      plain: "Client-side code for managing your spending categories (like Food, Transport, Entertainment).",
      path: "client/services/categories.service.ts",
      notes: ["Used by CategoryManager for inline CRUD", "Used by TransactionRow for category options", "Used by AddTransactionDialog category select"],
      tag: ["all", "settings", "transactions"],
    }),

  "svc-rules": N("svc-rules", "services", "CategoryRulesService", "client", "service", {
      role: "getAll/create/delete — REST client for /category-rules.",
      plain: "Client-side code for the auto-categorisation rules — when you say 'Starbucks = Coffee', this saves that rule.",
      path: "client/services/category-rules.service.ts",
      notes: ["create() auto-called by TransactionRow on inline re-categorise", "delete() only — no update (delete + recreate instead)"],
      tag: ["all", "settings"],
    }),

  // ── NestJS API ──────────────────────────────────────────────────────────────
  "api-guard": N("api-guard", "api", "AuthGuard", "@UseGuards", "external", {
      role: "Clerk JWT verification guard. Extracts clerkId from token, creates User row on first request (with 9 seeded categories), attaches to request.",
      plain: "The security checkpoint for every API request. Checks your auth token is valid, and if it's your first time using the app, creates your account automatically.",
      path: "server/src/auth/auth.guard.ts",
      notes: ["line:41, lazy user creation with temp email (known issue)", "Injects PrismaService to create/find User", "All controllers: @UseGuards(AuthGuard) at class level"],
      tag: ["all", "auth", "overview"],
    }),

  "api-accounts": N("api-accounts", "api", "AccountsController", "REST", "route", {
      role: "GET/POST/PATCH/DELETE /accounts — creates initial balance transaction on create, cascades on delete.",
      plain: "Handles all account management requests from the app. Creating an account automatically adds a starting balance entry.",
      path: "server/src/accounts/accounts.controller.ts",
      notes: ["POST creates account + OPENING_BALANCE transaction atomically", "DELETE cascades via Prisma schema"],
      tag: ["all", "accounts"],
    }),

  "api-transactions": N("api-transactions", "api", "TransactionsController", "REST", "route", {
      role: "GET/POST/PATCH/DELETE /transactions + POST /transactions/:id/import — handles bulk CSV import with auto-categorization.",
      plain: "Handles all transaction requests. The import endpoint processes a whole CSV file at once and automatically categorises transactions using your saved rules.",
      path: "server/src/transactions/transactions.controller.ts",
      notes: ["PATCH exists but update() has balance reconciliation bug", "DELETE blocked for source != MANUAL", "Import: applies CategoryRules before insert"],
      tag: ["all", "transactions"],
      critical: true,
    }),

  "api-categories": N("api-categories", "api", "CategoriesController", "REST", "route", {
      role: "GET/POST/PATCH/DELETE /categories — all scoped to userId.",
      plain: "Handles requests to manage spending categories.",
      path: "server/src/categories/categories.controller.ts",
      notes: ["Unique constraint: (name, userId)", "9 default categories seeded on user creation in AuthGuard"],
      tag: ["all", "settings"],
    }),

  "api-rules": N("api-rules", "api", "CategoryRulesController", "REST", "route", {
      role: "GET/POST/DELETE /category-rules — keyword→category mappings scoped to userId.",
      plain: "Handles requests to manage auto-categorisation rules.",
      path: "server/src/category-rules/category-rules.controller.ts",
      notes: ["Unique constraint: (keyword, userId)", "Auto-created by transactions controller during re-categorise"],
      tag: ["all", "settings"],
    }),

  // ── Server Services ─────────────────────────────────────────────────────────
  "server-accounts": N("server-accounts", "server-services", "AccountsService", "server", "service", {
      role: "Business logic for accounts — balance reconciliation on create/delete, ownership checks before mutations.",
      plain: "The actual account management logic on the server — makes sure your balance stays accurate when you add or remove transactions.",
      path: "server/src/accounts/accounts.service.ts",
      notes: ["create(): prisma.$transaction for atomicity", "delete(): Prisma cascade handles transaction cleanup", "update(): no balance reconciliation needed (balance is computed)"],
      tag: ["all", "accounts"],
    }),

  "server-transactions": N("server-transactions", "server-services", "TransactionsService", "server", "service", {
      role: "Transaction CRUD with balance side-effects. CSV import applies category rules. KNOWN BUG: update() ignores amount changes.",
      plain: "The transaction logic on the server. When you add a transaction, it automatically updates your account balance. The CSV import is smart enough to auto-categorize based on your rules.",
      path: "server/src/transactions/transactions.service.ts",
      notes: ["line:~45, create(): account.balance += amount", "BUG: update() strips amount — balance not reconciled", "import(): findFirst CategoryRule by keyword for each row"],
      tag: ["all", "transactions"],
      critical: true,
    }),

  "server-categories": N("server-categories", "server-services", "CategoriesService", "server", "service", {
      role: "Category CRUD scoped to userId. Ownership verified on all mutations.",
      plain: "Saves and retrieves your spending categories from the database.",
      path: "server/src/categories/categories.service.ts",
      notes: ["All queries: where: { userId }", "findOne checks ownership before returning"],
      tag: ["all", "settings"],
    }),

  "server-rules": N("server-rules", "server-services", "CategoryRulesService", "server", "service", {
      role: "CategoryRule CRUD with upsert on create (unique keyword+userId).",
      plain: "Saves and retrieves the auto-categorisation rules.",
      path: "server/src/category-rules/category-rules.service.ts",
      notes: ["create(): upsert — re-categorising with same keyword updates rather than throws", "All queries scoped to userId"],
      tag: ["all", "settings"],
    }),

  // ── Data ─────────────────────────────────────────────────────────────────────
  "data-prisma": N("data-prisma", "data", "PrismaService", "singleton ORM", "db", {
      role: "Prisma v7 Client singleton injected into every NestJS service. Type-safe query builder over PostgreSQL.",
      plain: "The layer that turns TypeScript code into database queries. It's injected into all server services so they can read and write data.",
      path: "server/src/prisma/prisma.service.ts",
      notes: ["@Injectable({ scope: Scope.DEFAULT })", "Extends PrismaClient", "All queries use userId scoping — no cross-tenant leakage"],
      tag: ["all", "overview", "data"],
      critical: true,
    }),

  "data-user": N("data-user", "data", "User", "Prisma model", "db", {
      role: "Root entity. id = Clerk userId. email is placeholder (known issue). All other models have userId FK.",
      plain: "Your user account in the database. It's the root of all your financial data — everything else links back to you.",
      path: "server/prisma/schema.prisma:User",
      notes: ["id = Clerk clerkId (String)", "email @unique — currently temp_{clerkId}@xaccapital.com", "createdAt auto-set"],
      tag: ["all", "data", "auth"],
    }),

  "data-account": N("data-account", "data", "Account", "Prisma model", "db", {
      role: "Financial account. type enum: CASH|SAVINGS|INVESTMENT|TRADING|CRYPTO|REAL_ESTATE. balance is maintained by service layer.",
      plain: "A financial account like a bank account, investment portfolio, or crypto wallet.",
      path: "server/prisma/schema.prisma:Account",
      notes: ["balance: Float maintained by TransactionsService", "isAutomated: Boolean for future bank sync", "cascade delete → all transactions"],
      tag: ["all", "data", "accounts"],
    }),

  "data-transaction": N("data-transaction", "data", "Transaction", "Prisma model", "db", {
      role: "Income/expense entry. source: MANUAL|BANK|CSV. Only MANUAL can be deleted via API.",
      plain: "A single money movement — a purchase, payment, or income. Remembers where it came from (manual entry vs CSV vs bank sync).",
      path: "server/prisma/schema.prisma:Transaction",
      notes: ["source enum guards delete in controller", "categoryId nullable — null = uncategorized", "isRecurring: Boolean shown as SUB badge in UI"],
      tag: ["all", "data", "transactions"],
      critical: true,
    }),

  "data-category": N("data-category", "data", "Category", "Prisma model", "db", {
      role: "User-defined label. type: INCOME|EXPENSE. 9 defaults seeded on user creation.",
      plain: "A label you use to group transactions — like 'Food', 'Rent', 'Salary'. Nine are created for you automatically when you first sign up.",
      path: "server/prisma/schema.prisma:Category",
      notes: ["Unique: (name, userId)", "color: String hex e.g. #059669", "icon: String? — stored but not yet used in UI"],
      tag: ["all", "data", "settings"],
    }),

  "data-rule": N("data-rule", "data", "CategoryRule", "Prisma model", "db", {
      role: "keyword → category mapping. Auto-created when user re-categorizes. Applied during CSV import.",
      plain: "A saved rule like 'whenever a transaction mentions Starbucks, tag it as Coffee'. Created automatically when you change a category.",
      path: "server/prisma/schema.prisma:CategoryRule",
      notes: ["Unique: (keyword, userId)", "Applied in order during CSV import bulk insert", "keyword is lowercase-normalized"],
      tag: ["all", "data", "settings"],
    }),

  // ── External ─────────────────────────────────────────────────────────────────
  "ext-clerk": N("ext-clerk", "external", "Clerk", "auth provider", "external", {
      role: "Third-party auth service. Issues JWTs. Middleware + AuthGuard verify tokens. UI via ClerkProvider + UserButton.",
      plain: "The service that handles login/logout and manages your account credentials. XAC Capital never stores your password — Clerk does.",
      path: "client/middleware.ts + server/src/auth/auth.guard.ts",
      notes: ["JWT verified in AuthGuard via Clerk JWKS", "UserButton renders avatar + sign-out dropdown", "No webhook configured — user email is placeholder"],
      tag: ["all", "auth", "overview"],
    }),

  "ext-postgres": N("ext-postgres", "external", "PostgreSQL 15", "database", "db", {
      role: "Primary relational database. All data isolated per userId. Cascade deletes and unique constraints enforced at DB level.",
      plain: "The actual database where all your financial data is stored. Completely isolated — no one else can see your data.",
      path: "server/prisma/schema.prisma",
      notes: ["All models have userId FK", "Cascades: Account→Transaction", "Unique: (keyword,userId) (name,userId)", "Connection via DATABASE_URL env var"],
      tag: ["all", "data", "overview"],
      critical: true,
    }),

};

export const GRAPH_NODES: Array<GraphNode> = Object.values(GRAPH_NODES_MAP);

// ─── Edges ────────────────────────────────────────────────────────────────────

export const GRAPH_EDGES: Array<GraphEdge> = [
  // Entry → Routes (middleware guards)
  { from: "entry-middleware", to: "route-dashboard",     kind: "mount",    label: "auth check",    tag: ["all", "auth"] },
  { from: "entry-middleware", to: "route-transactions",  kind: "mount",    label: "auth check",    tag: ["all", "auth", "transactions"] },
  { from: "entry-layout",     to: "entry-navbar",        kind: "mount",    label: "renders",       tag: ["all", "overview"] },
  { from: "entry-layout",     to: "entry-theme",         kind: "mount",    label: "wraps",         tag: ["all", "overview"] },
  { from: "entry-middleware", to: "ext-clerk",           kind: "api",      label: "JWT verify",    tag: ["all", "auth"] },

  // Routes → Components (critical path highlighted)
  { from: "route-transactions",  to: "comp-add-transaction",  kind: "critical", label: "renders",   tag: ["all", "transactions"] },
  { from: "route-transactions",  to: "comp-csv-importer",     kind: "mount",    label: "renders",   tag: ["all", "transactions"] },
  { from: "route-transactions",  to: "comp-transaction-row",  kind: "mount",    label: "renders",   tag: ["all", "transactions"] },
  { from: "route-accounts",      to: "comp-manage-account",   kind: "mount",    label: "renders",   tag: ["all", "accounts"] },
  { from: "route-dashboard",     to: "comp-charts",           kind: "mount",    label: "renders",   tag: ["all", "dashboard"] },

  // Routes → Client Services (data fetch)
  { from: "route-dashboard",    to: "svc-accounts",     kind: "normal", label: "GET accounts",       tag: ["all", "dashboard"] },
  { from: "route-dashboard",    to: "svc-transactions", kind: "normal", label: "GET transactions",   tag: ["all", "dashboard"] },
  { from: "route-transactions", to: "svc-accounts",     kind: "normal", label: "GET accounts",       tag: ["all", "transactions"] },
  { from: "route-accounts",     to: "svc-accounts",     kind: "normal", label: "GET accounts",       tag: ["all", "accounts"] },
  { from: "route-assets",       to: "svc-accounts",     kind: "normal", label: "GET accounts",       tag: ["all", "wealth"] },
  { from: "route-settings",     to: "svc-categories",   kind: "normal", label: "GET categories",     tag: ["all", "settings"] },
  { from: "route-settings",     to: "svc-rules",        kind: "normal", label: "GET rules",          tag: ["all", "settings"] },

  // Components → Client Services (mutations — critical path)
  { from: "comp-add-transaction", to: "svc-transactions", kind: "critical", label: "POST create",  tag: ["all", "transactions"] },
  { from: "comp-manage-account",  to: "svc-accounts",     kind: "api",      label: "POST/PATCH/DELETE", tag: ["all", "accounts"] },
  { from: "comp-csv-importer",    to: "svc-transactions", kind: "api",      label: "POST import",  tag: ["all", "transactions"] },
  { from: "comp-transaction-row", to: "svc-rules",        kind: "api",      label: "POST rule",    tag: ["all", "transactions"] },

  // Client Services → API (REST calls)
  { from: "svc-accounts",     to: "api-accounts",     kind: "api",      label: "REST /accounts",      tag: ["all", "accounts"] },
  { from: "svc-transactions", to: "api-transactions", kind: "critical", label: "POST /transactions",  tag: ["all", "transactions"] },
  { from: "svc-categories",   to: "api-categories",   kind: "api",      label: "REST /categories",    tag: ["all", "settings"] },
  { from: "svc-rules",        to: "api-rules",        kind: "api",      label: "REST /category-rules", tag: ["all", "settings"] },

  // API → AuthGuard
  { from: "api-accounts",     to: "api-guard", kind: "normal", label: "guarded", tag: ["all", "auth"] },
  { from: "api-transactions", to: "api-guard", kind: "normal", label: "guarded", tag: ["all", "auth"] },
  { from: "api-categories",   to: "api-guard", kind: "normal", label: "guarded", tag: ["all", "auth"] },
  { from: "api-rules",        to: "api-guard", kind: "normal", label: "guarded", tag: ["all", "auth"] },

  // API → Server Services
  { from: "api-accounts",     to: "server-accounts",     kind: "normal",   label: "delegates",     tag: ["all", "accounts"] },
  { from: "api-transactions", to: "server-transactions", kind: "critical", label: "delegates",     tag: ["all", "transactions"] },
  { from: "api-categories",   to: "server-categories",   kind: "normal",   label: "delegates",     tag: ["all", "settings"] },
  { from: "api-rules",        to: "server-rules",        kind: "normal",   label: "delegates",     tag: ["all", "settings"] },

  // Server Services → Prisma (critical path)
  { from: "server-accounts",     to: "data-prisma", kind: "db",       label: "prisma.*",         tag: ["all", "accounts"] },
  { from: "server-transactions", to: "data-prisma", kind: "critical", label: "prisma.create",    tag: ["all", "transactions"] },
  { from: "server-categories",   to: "data-prisma", kind: "db",       label: "prisma.*",         tag: ["all", "settings"] },
  { from: "server-rules",        to: "data-prisma", kind: "db",       label: "prisma.upsert",    tag: ["all", "settings"] },

  // Prisma → External
  { from: "data-prisma",     to: "ext-postgres", kind: "critical", label: "pg protocol",   tag: ["all", "data"] },

  // AuthGuard → Clerk + User model
  { from: "api-guard",   to: "ext-clerk",   kind: "api", label: "JWKS verify",  tag: ["all", "auth"] },
  { from: "api-guard",   to: "data-user",   kind: "db",  label: "upsert user",  tag: ["all", "auth"] },
];

// ─── Bugs + Fixes (keyed by node id) ─────────────────────────────────────────
// Rendered as red/green badges on each node. Tied to issues.registry.ts ids.

export const GRAPH_BUGS: Partial<Record<GraphNodeId, Array<GraphBug>>> = {
  "server-transactions": [
    { sev: "high", ref: "transaction-update-balance", t: "update() drops amount changes — account balance becomes stale" },
  ],
  "api-transactions": [
    { sev: "low", ref: "import-wrong-account-500", t: "Import to wrong account returns Prisma 500 instead of 403" },
  ],
  "api-guard": [
    { sev: "medium", ref: "user-email-temp", t: "User created with temp email — no Clerk webhook sync" },
  ],
  "ext-postgres": [
    { sev: "high", ref: "cors-hardcoded", t: "CORS origin hardcoded to localhost:3001 in server/src/main.ts" },
    { sev: "medium", ref: "no-server-pagination", t: "All transactions loaded in memory — no server-side pagination" },
  ],
  "comp-manage-account": [
    { sev: "medium", ref: "trading-type-missing-ui", t: "TRADING account type missing from create/edit dialog" },
  ],
};

export const GRAPH_FIXES: Partial<Record<GraphNodeId, Array<GraphFix>>> = {
  "server-transactions": [
    { n: 1, t: "Add balance reconciliation to update() — reverse old amount, apply new amount" },
  ],
  "api-transactions": [
    { n: 1, t: "Catch Prisma error in import endpoint and return 403/404" },
  ],
  "api-guard": [
    { n: 1, t: "Add Clerk webhook endpoint to sync real email on user creation" },
  ],
  "comp-manage-account": [
    { n: 1, t: "Add TRADING to the account type selector options" },
  ],
  "ext-postgres": [
    { n: 1, t: "Move CORS origin to CORS_ORIGIN env var in main.ts" },
    { n: 2, t: "Add cursor-based pagination to TransactionsService.findAll()" },
  ],
};

// ─── Registry enforcement mappings ───────────────────────────────────────────
// These `satisfies` checks create the chain: AppRoutePath → GraphNodeId.
// Add a route to AppRoutePath without updating this → TypeScript error here.

export const ROUTE_TO_GRAPH_NODE = {
  "/":          "route-dashboard",
  "/transactions": "route-transactions",
  "/assets":    "route-assets",
  "/accounts":  "route-accounts",
  "/settings":  "route-settings",
  "/docs":      "route-docs",
  "/docs/map":  "route-docs-map",
} satisfies Record<AppRoutePath, GraphNodeId>;

// Add a module to ServerModuleKey without updating this → TypeScript error.
export const MODULE_TO_GRAPH_NODES = {
  "accounts":       ["api-accounts",     "server-accounts"]     as [GraphNodeId, GraphNodeId],
  "transactions":   ["api-transactions", "server-transactions"] as [GraphNodeId, GraphNodeId],
  "categories":     ["api-categories",   "server-categories"]   as [GraphNodeId, GraphNodeId],
  "category-rules": ["api-rules",        "server-rules"]        as [GraphNodeId, GraphNodeId],
} satisfies Record<ServerModuleKey, [GraphNodeId, GraphNodeId]>;
