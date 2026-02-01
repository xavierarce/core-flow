import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service";
import { TransactionList, AppCard } from "@/components/shared";
import { CsvImporter } from "@/components/shared/CsvImporter";
import { AddTransactionDialog } from "@/components/shared/AddTransactionDialog";
import { Account, Transaction } from "@/types";
import Link from "next/link";
import {
  Wallet,
  Building2,
  TrendingUp,
  Layers,
  ChevronDown,
} from "lucide-react";
import { subYears, endOfYear, parseISO } from "date-fns";
import { TransactionFilters } from "../../components/shared/TransactionFilters";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{
    accountId?: string;
    query?: string;
    date?: string;
    limit?: string; // 👈 New Param for pagination
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const params = await searchParams;
  const { accountId, query } = params;

  // 1. 📅 Handle Date Defaults
  // If 'date' is missing, default to Current Month (YYYY-MM).
  // If 'date' is "all", we show everything.
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2026-02"
  const selectedDate = params.date === undefined ? currentMonth : params.date;

  // 2. 🔢 Handle Limits
  // Default to 20 items. Increase by 20 when clicking "See More".
  const currentLimit = params.limit ? parseInt(params.limit) : 20;

  // Fetch Data (Wide range, allow filtering in memory)
  const startDate = subYears(new Date(), 2).toISOString();
  const endDate = endOfYear(new Date()).toISOString();

  const [accounts, categories] = await Promise.all([
    AccountsService.getAll(token, startDate, endDate),
    CategoriesService.getAll(token),
  ]);

  const activeAccount = accountId
    ? accounts.find((a: Account) => a.id === accountId)
    : null;

  let transactions = activeAccount
    ? activeAccount.transactions
    : accounts.flatMap((a: Account) => a.transactions);

  // 3. 🛡️ APPLY FILTERS

  // A. Date Filter
  if (selectedDate !== "all") {
    transactions = transactions.filter((tx: Transaction) =>
      tx.date.toString().startsWith(selectedDate),
    );
  }

  // B. Search Filter
  if (query) {
    const lowerQuery = query.toLowerCase();
    transactions = transactions.filter(
      (tx: Transaction) =>
        tx.description.toLowerCase().includes(lowerQuery) ||
        tx.amount.toString().includes(lowerQuery) ||
        tx.category?.name.toLowerCase().includes(lowerQuery),
    );
  }

  // 4. Sort
  transactions.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // 5. ✂️ APPLY LIMIT (Pagination)
  const totalCount = transactions.length;
  const visibleTransactions = transactions.slice(0, currentLimit);
  const hasMore = totalCount > currentLimit;

  // Icons Helper
  const getIcon = (type: string) => {
    if (type === "INVESTMENT") return <TrendingUp size={14} />;
    if (type === "SAVINGS") return <Building2 size={14} />;
    return <Wallet size={14} />;
  };

  // Helper to build "See More" URL
  const getSeeMoreUrl = () => {
    const newParams = new URLSearchParams();
    if (accountId) newParams.set("accountId", accountId);
    if (query) newParams.set("query", query);
    // Persist the date (or current month if default)
    newParams.set("date", selectedDate);
    // Increase limit
    newParams.set("limit", (currentLimit + 20).toString());
    return `/transactions?${newParams.toString()}`;
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

        {/* TAB SELECTOR */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
          <Link
            href={`/transactions?date=${selectedDate}`}
            className="shrink-0"
          >
            <div
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-sm ${!accountId ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-200 text-slate-600"}`}
            >
              <Layers size={16} /> All Accounts
            </div>
          </Link>
          {accounts.map((acc: Account) => (
            <Link
              key={acc.id}
              // Ensure we keep the date filter when switching accounts
              href={`/transactions?accountId=${acc.id}&date=${selectedDate}${query ? `&query=${query}` : ""}`}
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

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 👇 Pass the current selected date to the Client Component */}
          <TransactionFilters defaultDate={selectedDate} />

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

        {/* DATA LIST */}
        <AppCard
          // Dynamic Title based on selection
          title={
            selectedDate === "all" ? "All History" : `Activity: ${selectedDate}`
          }
          subtitle={`Showing ${visibleTransactions.length} of ${totalCount} transactions`}
          className="min-h-[500px]"
        >
          {visibleTransactions.length > 0 ? (
            <div className="space-y-4">
              <TransactionList
                transactions={visibleTransactions}
                categories={categories}
              />

              {/* 👇 THE SEE MORE BUTTON */}
              {hasMore && (
                <div className="pt-4 flex justify-center border-t border-slate-100">
                  <Link href={getSeeMoreUrl()} scroll={false}>
                    <Button variant="outline" className="gap-2 text-slate-600">
                      Show more transactions <ChevronDown size={14} />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <p>No results found for {selectedDate}.</p>
            </div>
          )}
        </AppCard>
      </div>
    </main>
  );
}
