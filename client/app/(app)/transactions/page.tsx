import { auth } from "@clerk/nextjs/server";
import { subYears, endOfYear } from "date-fns";
import { ChevronDown, Layers } from "lucide-react";
import Link from "next/link";

import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service";
import { Account, Transaction } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionList, AppCard, CsvImporter, AddTransactionDialog, TransactionFilters } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { getAccountIcon } from "@/lib/account.utils";

interface PageProps {
  searchParams: Promise<{
    accountId?: string;
    query?: string;
    date?: string;
    limit?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const params = await searchParams;
  const { accountId, query } = params;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const selectedDate = params.date === undefined ? currentMonth : params.date;
  const currentLimit = params.limit ? parseInt(params.limit) : 20;

  const startDate = subYears(new Date(), 2).toISOString();
  const endDate = endOfYear(new Date()).toISOString();

  const [allAccounts, categories] = await Promise.all([
    AccountsService.getAll(token, startDate, endDate),
    CategoriesService.getAll(token),
  ]);

  // Transactions = cash-flow view: Cash and Savings accounts only
  const accounts = allAccounts.filter((a: Account) =>
    ["CASH", "SAVINGS"].includes(a.type)
  );

  const activeAccount = accountId
    ? accounts.find((a: Account) => a.id === accountId)
    : null;

  let transactions: Array<Transaction> = activeAccount
    ? activeAccount.transactions
    : accounts.flatMap((a: Account) => a.transactions);

  if (selectedDate !== "all") {
    transactions = transactions.filter((tx) =>
      tx.date.toString().startsWith(selectedDate)
    );
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    transactions = transactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(lowerQuery) ||
        tx.amount.toString().includes(lowerQuery) ||
        tx.category?.name.toLowerCase().includes(lowerQuery)
    );
  }

  transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalCount = transactions.length;
  const visibleTransactions = transactions.slice(0, currentLimit);
  const hasMore = totalCount > currentLimit;

  const getSeeMoreUrl = () => {
    const p = new URLSearchParams();
    if (accountId) p.set("accountId", accountId);
    if (query) p.set("query", query);
    p.set("date", selectedDate);
    p.set("limit", (currentLimit + 20).toString());
    return `/transactions?${p.toString()}`;
  };

  const hasManualAccounts = accounts.some((a: Account) => !a.isAutomated);
  const showImportAndAdd = activeAccount
    ? !activeAccount.isAutomated
    : hasManualAccounts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="Manage your expenses and history."
      />

      {/* Account tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 border-b border-border">
        <Link href={`/transactions?date=${selectedDate}`} className="shrink-0">
          <div
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-sm ${
              !accountId
                ? "bg-foreground border-foreground text-background shadow-md"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers size={16} /> All Accounts
          </div>
        </Link>
        {accounts.map((acc: Account) => (
          <Link
            key={acc.id}
            href={`/transactions?accountId=${acc.id}&date=${selectedDate}${query ? `&query=${query}` : ""}`}
            className="shrink-0"
          >
            <div
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-sm ${
                accountId === acc.id
                  ? "bg-foreground border-foreground text-background shadow-md"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {getAccountIcon(acc.type)} {acc.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <TransactionFilters defaultDate={selectedDate} />
        {showImportAndAdd && (
          <div className="flex gap-2">
            <CsvImporter
              accounts={
                activeAccount
                  ? [activeAccount]
                  : accounts.filter((a: Account) => !a.isAutomated)
              }
            />
            <AddTransactionDialog
              accounts={
                activeAccount
                  ? [activeAccount]
                  : accounts.filter((a: Account) => !a.isAutomated)
              }
              categories={categories}
            />
          </div>
        )}
      </div>

      {/* Transaction list */}
      <AppCard
        title={selectedDate === "all" ? "All History" : `Activity: ${selectedDate}`}
        subtitle={`Showing ${visibleTransactions.length} of ${totalCount} transactions`}
        className="min-h-[500px]"
      >
        {visibleTransactions.length > 0 ? (
          <div className="space-y-4">
            <TransactionList
              transactions={visibleTransactions}
              categories={categories}
            />
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
  );
}
