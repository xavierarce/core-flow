import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service";
import { TransactionList } from "@/components/shared";
import { CsvImporter } from "@/components/shared/CsvImporter";
import { AddTransactionDialog } from "@/components/shared/AddTransactionDialog";
import { Account, Category } from "@/types";
import Link from "next/link";
import { Filter } from "lucide-react";

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

  // 1. Fetch ALL data (we need the list of accounts to build the filter)
  const [accounts, categories] = await Promise.all([
    AccountsService.getAll(token), // Need all to populate dropdown
    CategoriesService.getAll(token),
  ]);

  // 2. Filter: Determine which account is "Active"
  const activeAccount = selectedAccountId
    ? accounts.find((a: Account) => a.id === selectedAccountId)
    : null;

  // 3. Filter: Get transactions for the view
  // (If no account selected, we could show ALL, or show Empty State. Let's show All.)
  let displayedTransactions = activeAccount
    ? activeAccount.transactions
    : accounts.flatMap((a: Account) => a.transactions);

  // Sort by date desc
  displayedTransactions.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
            <p className="text-slate-500 mt-1">
              {activeAccount
                ? `Managing: ${activeAccount.name}`
                : "Viewing all activity"}
            </p>
          </div>

          <div className="flex gap-2">
            {/* Context-Aware Buttons */}
            {activeAccount && !activeAccount.isAutomated && (
              <>
                <CsvImporter accounts={[activeAccount]} />
                <AddTransactionDialog
                  accounts={[activeAccount]}
                  categories={categories as Category[]}
                />
              </>
            )}

            {/* Fallback if viewing 'All' - Allow adding to any manual account */}
            {!activeAccount && (
              <AddTransactionDialog
                accounts={accounts.filter((a: Account) => !a.isAutomated)}
                categories={categories as Category[]}
              />
            )}
          </div>
        </div>

        {/* MAIN LAYOUT: SIDEBAR + LIST */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR: Account Filter */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Filter size={16} /> Filter by Account
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/transactions">
                <div
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    !selectedAccountId
                      ? "bg-slate-900 text-white"
                      : "bg-white hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  All Accounts
                </div>
              </Link>

              {accounts.map((acc: Account) => (
                <Link key={acc.id} href={`/transactions?accountId=${acc.id}`}>
                  <div
                    className={`
                    p-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                    ${
                      selectedAccountId === acc.id
                        ? "bg-slate-900 text-white"
                        : "bg-white hover:bg-slate-100 text-slate-600"
                    }
                  `}
                  >
                    <span>{acc.name}</span>
                    {/* Small dot for connection status */}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        acc.isAutomated ? "bg-blue-400" : "bg-amber-400"
                      }`}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT: Transaction List */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
              <TransactionList
                transactions={displayedTransactions}
                categories={categories as Category[]}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
