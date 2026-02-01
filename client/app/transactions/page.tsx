import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service";
import { TransactionList, AppCard } from "@/components/shared";
import { CsvImporter } from "@/components/shared/CsvImporter";
import { AddTransactionDialog } from "@/components/shared/AddTransactionDialog";
import { Account, Category } from "@/types";
import Link from "next/link";
import { Wallet, Building2, TrendingUp, Layers } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    accountId?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const params = await searchParams;
  const selectedAccountId = params.accountId;

  const [accounts, categories] = await Promise.all([
    AccountsService.getAll(token),
    CategoriesService.getAll(token),
  ]);

  const activeAccount = selectedAccountId
    ? accounts.find((a: Account) => a.id === selectedAccountId)
    : null;

  let displayedTransactions = activeAccount
    ? activeAccount.transactions
    : accounts.flatMap((a: Account) => a.transactions);

  displayedTransactions.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const getIcon = (type: string) => {
    if (type === "INVESTMENT") return <TrendingUp size={14} />;
    if (type === "SAVINGS") return <Building2 size={14} />;
    return <Wallet size={14} />;
  };

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* 1. TOP HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 mt-1">
            Review your spending history and categorize expenses.
          </p>
        </div>

        {/* 2. TAB SELECTOR */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
          <Link href="/transactions" className="shrink-0">
            <div
              className={`
                px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-sm
                ${
                  !selectedAccountId
                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }
              `}
            >
              <Layers size={16} />
              All Accounts
            </div>
          </Link>

          {accounts.map((acc: Account) => (
            <Link
              key={acc.id}
              href={`/transactions?accountId=${acc.id}`}
              className="shrink-0"
            >
              <div
                className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-sm ${selectedAccountId === acc.id ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
              >
                {getIcon(acc.type)}
                {acc.name}
                <div
                  className={`w-2 h-2 rounded-full ml-1 ${acc.isAutomated ? "bg-blue-400" : "bg-amber-400"}`}
                  title={acc.isAutomated ? "Synced" : "Manual"}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* 3. CONTEXT ACTIONS (The White Bar) */}
        {/* We keep this as a simple div because it's a toolbar, not a content card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            {activeAccount ? (
              <span>
                Viewing <strong>{activeAccount.name}</strong> •{" "}
                {activeAccount.currency}{" "}
                {Number(activeAccount.balance).toLocaleString()}
              </span>
            ) : (
              <span>
                Viewing all <strong>{displayedTransactions.length}</strong>{" "}
                transactions
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {activeAccount && !activeAccount.isAutomated && (
              <>
                <CsvImporter accounts={[activeAccount]} />
                <AddTransactionDialog
                  accounts={[activeAccount]}
                  categories={categories}
                />
              </>
            )}
            {!activeAccount && (
              <AddTransactionDialog
                accounts={accounts.filter((a: Account) => !a.isAutomated)}
                categories={categories}
              />
            )}
          </div>
        </div>

        {/* 4. THE DATA LIST (Wrapped in AppCard) 📦 */}
        <AppCard
          title="Activity Log"
          subtitle={activeAccount ? activeAccount.institution : "Global View"}
          className="min-h-[500px]" // Force height for better empty state look
        >
          {displayedTransactions.length > 0 ? (
            <TransactionList
              transactions={displayedTransactions}
              categories={categories}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <Layers size={24} />
              </div>
              <p>No transactions found for this selection.</p>
            </div>
          )}
        </AppCard>
      </div>
    </main>
  );
}
