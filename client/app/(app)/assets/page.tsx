import { auth } from "@clerk/nextjs/server";

import { AccountsService } from "@/services/accounts.service";
import { Account } from "@/types";
import { formatBalance, getAccountIcon } from "@/lib/account.utils";

import { PageHeader } from "@/components/layout/PageHeader";
import { AppCard, WealthChart } from "@/components/shared";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash & Banking",
  SAVINGS: "Savings",
  INVESTMENT: "Investments",
  TRADING: "Trading",
  CRYPTO: "Crypto",
  REAL_ESTATE: "Real Estate",
};

const WEALTH_TYPES = ["INVESTMENT", "TRADING", "CRYPTO", "REAL_ESTATE"];

export default async function WealthPage() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const allAccounts: Array<Account> = await AccountsService.getAll(token);
  const accounts = allAccounts.filter((a) => WEALTH_TYPES.includes(a.type));

  const totalWealth = AccountsService.calculateNetWorth(accounts);

  const wealthData = accounts
    .filter((a) => Number(a.balance) > 0)
    .map((a) => ({ name: a.name, value: Number(a.balance) }));

  // Group accounts by type for the breakdown section
  const grouped = accounts.reduce<Record<string, Array<Account>>>((acc, account) => {
    const key = account.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(account);
    return acc;
  }, {});

  const groupedEntries = Object.entries(grouped).sort(
    ([, a], [, b]) =>
      b.reduce((s, x) => s + Number(x.balance), 0) -
      a.reduce((s, x) => s + Number(x.balance), 0)
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title="Wealth"
        subtitle="Your portfolio at a glance."
        action={
          <div className="text-right p-4 bg-card rounded-2xl border border-border shadow-sm min-w-[200px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Portfolio Value
            </p>
            <p className="text-4xl font-black text-emerald-500">
              €{totalWealth.toLocaleString()}
            </p>
          </div>
        }
      />

      {/* Allocation chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <WealthChart data={wealthData} />
        </div>

        {/* Summary by type */}
        <div className="md:col-span-2">
          <AppCard title="Allocation by Type" subtitle="Grouped balances">
            <div className="divide-y divide-border">
              {groupedEntries.map(([type, typeAccounts]) => {
                const subtotal = typeAccounts.reduce(
                  (s, a) => s + Number(a.balance),
                  0
                );
                const pct =
                  totalWealth > 0
                    ? ((subtotal / totalWealth) * 100).toFixed(1)
                    : "0";

                return (
                  <div key={type} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-muted rounded-lg border border-border">
                        {getAccountIcon(type)}
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        {ACCOUNT_TYPE_LABELS[type] ?? type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {typeAccounts.length}{" "}
                        {typeAccounts.length === 1 ? "account" : "accounts"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-sm">
                        €{subtotal.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{pct}%</p>
                    </div>
                  </div>
                );
              })}
              {groupedEntries.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  No investment accounts yet. Add a Crypto, Investment, or Trading account to track your portfolio.
                </p>
              )}
            </div>
          </AppCard>
        </div>
      </div>

      {/* Individual accounts */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 tracking-tight">
            Holdings
          </h2>
          <div className="grid gap-3">
            {accounts
              .slice()
              .sort((a, b) => Number(b.balance) - Number(a.balance))
              .map((account) => {
                const pct =
                  totalWealth > 0
                    ? ((Number(account.balance) / totalWealth) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={account.id}
                    className="bg-card rounded-xl border border-border px-5 py-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg border border-border">
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.institution} · {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-end gap-1 w-32">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {pct}% of portfolio
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatBalance(account.balance, account.currency)}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            account.isAutomated
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {account.isAutomated ? "SYNCED" : "MANUAL"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
