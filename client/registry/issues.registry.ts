import type { KnownIssue } from "@/types/registry.types";

// Known bugs and technical debt. Each entry needs a unique id, severity, and description.
// Remove an entry when the issue is resolved. Add entries when new issues are discovered.

export const ISSUES_REGISTRY: Array<KnownIssue> = [
  {
    id: "cors-hardcoded",
    severity: "high",
    label: "CORS hardcoded to localhost",
    description:
      "server/src/main.ts has origin: 'http://localhost:3001'. Must be an environment variable before any deployment to staging or production.",
    file: "server/src/main.ts",
  },
  {
    id: "transaction-update-balance",
    severity: "high",
    label: "Transaction update does not reconcile balance",
    description:
      "transactions.service.ts update() destructures amount but never uses it to adjust the account balance. Editing a transaction amount via the API leaves the account balance stale.",
    file: "server/src/transactions/transactions.service.ts",
  },
  {
    id: "trading-type-missing-ui",
    severity: "medium",
    label: "TRADING account type missing from create dialog",
    description:
      "ManageAccountDialog doesn't include TRADING in the type selector. The Prisma schema and AccountType enum both support it, but users can't create Trading accounts via the UI.",
    file: "client/components/shared/ManageAccountDialog/ManageAccountDialog.tsx",
  },
  {
    id: "no-server-pagination",
    severity: "medium",
    label: "No server-side pagination",
    description:
      "All transactions are loaded per account on every request. With large datasets this will be slow and consume excessive memory on the server.",
    file: "server/src/transactions/transactions.service.ts",
  },
  {
    id: "user-email-temp",
    severity: "medium",
    label: "User email is a placeholder",
    description:
      "AuthGuard creates users with temp_{clerkId}@xaccapital.com. No Clerk webhook is configured to sync the real email. Querying users by email will fail.",
    file: "server/src/auth/auth.guard.ts",
  },
  {
    id: "validation-whitelist",
    severity: "low",
    label: "ValidationPipe missing whitelist: true",
    description:
      "Extra fields in request bodies are passed through to Prisma rather than being stripped. Add whitelist: true to the global ValidationPipe in main.ts.",
    file: "server/src/main.ts",
  },
  {
    id: "import-wrong-account-500",
    severity: "low",
    label: "CSV import to wrong account returns 500",
    description:
      "Attempting to import to another user's account produces a Prisma error (500) instead of a proper 403/404. The Prisma where clause rejects it correctly but the error is not caught.",
    file: "server/src/transactions/transactions.service.ts",
  },
];
