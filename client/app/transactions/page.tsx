import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service";
import { TransactionList, AppCard } from "@/components/shared";

import { CsvImporter } from "@/components/shared/CsvImporter";
import { AddTransactionDialog } from "@/components/shared/AddTransactionDialog";
import { Account, Transaction } from "@/types";
import Link from "next/link";
import { Wallet, Building2, TrendingUp, Layers } from "lucide-react";
import { subYears, endOfYear, parseISO, isSameMonth } from "date-fns";
import { TransactionFilters } from "./transactionFilter";

interface PageProps {
  searchParams: Promise<{
    accountId?: string;
    query?: string; // 👈 New Param
    date?: string; // 👈 New Param
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const params = await searchParams;
  const { accountId, query, date } = params;

  // 1. Fetch Wide Range (Last 2 Years)
  // We fetch widely, then filter in memory for speed/flexibility on search
  const startDate = subYears(new Date(), 2).toISOString();
  const endDate = endOfYear(new Date()).toISOString();

  const [accounts, categories] = await Promise.all([
    AccountsService.getAll(token, startDate, endDate),
    CategoriesService.getAll(token),
  ]);

  // 2. Initial Data Set (Active Account vs All)
  const activeAccount = accountId
    ? accounts.find((a: Account) => a.id === accountId)
    : null;

  let transactions = activeAccount
    ? activeAccount.transactions
    : accounts.flatMap((a: Account) => a.transactions);

  // 3. 🛡️ APPLY FILTERS (The Management Logic)

  // A. Date Filter ("2026-02")
  if (date) {
    const targetDate = parseISO(date); // e.g. 2026-02-01
    transactions = transactions.filter(
      (tx: Transaction) => tx.date.toString().startsWith(date), // Simple string check "2026-02..."
    );
  }

  // B. Search Filter ("McDonalds")
  if (query) {
    const lowerQuery = query.toLowerCase();
    transactions = transactions.filter(
      (tx: Transaction) =>
        tx.description.toLowerCase().includes(lowerQuery) ||
        tx.amount.toString().includes(lowerQuery) ||
        tx.category?.name.toLowerCase().includes(lowerQuery),
    );
  }

  // 4. Sort Remaining Data
  transactions.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Icons Helper
  const getIcon = (type: string) => {
    if (type === "INVESTMENT") return <TrendingUp size={14} />;
    if (type === "SAVINGS") return <Building2 size={14} />;
    return <Wallet size={14} />;
  };

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 mt-1">
            Manage your expenses and history.
          </p>
        </div>

        {/* TAB SELECTOR (Unchanged) */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
          {/* ... (Keep your existing Tab code here) ... */}
          <Link href="/transactions" className="shrink-0">
            <div
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-sm ${!accountId ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-600"}`}
            >
              <Layers size={16} /> All Accounts
            </div>
          </Link>
          {accounts.map((acc: Account) => (
            <Link
              key={acc.id}
              href={`/transactions?accountId=${acc.id}${query ? `&query=${query}` : ""}${date ? `&date=${date}` : ""}`}
              className="shrink-0"
            >
              <div
                className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-sm ${accountId === acc.id ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-600"}`}
              >
                {getIcon(acc.type)} {acc.name}
              </div>
            </Link>
          ))}
        </div>

        {/* 3. TOOLBAR (Updated with Filter) 🛠️ */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          {/* LEFT: The Filters */}
          <TransactionFilters />

          {/* RIGHT: The Actions */}
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

        {/* 4. THE DATA LIST */}
        <AppCard
          title={date ? `Activity: ${date}` : "All Activity"}
          subtitle={`Found ${transactions.length} transactions`}
          className="min-h-[500px]"
        >
          {transactions.length > 0 ? (
            <TransactionList
              transactions={transactions}
              categories={categories}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <p>No results found for "{query || date}".</p>
            </div>
          )}
        </AppCard>
      </div>
    </main>
  );
}
