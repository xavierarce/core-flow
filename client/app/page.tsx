import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service"; // 👈 New Import
import {
  WealthChart,
  CashFlowChart,
  AppCard, // 👈 Use your Card
  TransactionList, // 👈 Reuse the list component
} from "@/components/shared";
import { ExpenseChart } from "@/components/shared/ExpenseChart";
import { MonthFilter } from "@/components/shared/MonthFilter";
import {
  calculateMonthlyCashFlow,
  calculateExpenseBreakdown,
} from "@/lib/finance.utils";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Account, Category } from "@/types"; // 👈 Import Category type
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HomeProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function Dashboard({ searchParams }: HomeProps) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();
  const monthName = selectedDate.toLocaleString("en-US", { month: "long" });

  const viewStart = startOfMonth(selectedDate).toISOString();
  const viewEnd = endOfMonth(selectedDate).toISOString();
  const chartStart = subMonths(new Date(), 5).toISOString();
  const chartEnd = endOfMonth(new Date()).toISOString();

  // 1. Fetch Data (Added Categories)
  const [currentAccounts, trendAccounts, categories] = await Promise.all([
    AccountsService.getAll(token, viewStart, viewEnd),
    AccountsService.getAll(token, chartStart, chartEnd),
    CategoriesService.getAll(token), // 👈 Needed for the list badges
  ]);

  // 2. Metrics
  const totalWealth = AccountsService.calculateNetWorth(currentAccounts);

  const wealthData = currentAccounts.map((acc: Account) => ({
    name: acc.name,
    value: Number(acc.balance),
  }));

  const cashFlowData = calculateMonthlyCashFlow(trendAccounts);
  const expenseData = calculateExpenseBreakdown(currentAccounts);

  // 3. Prepare Recent Activity (The Logic) 🧠
  // We take all transactions from all accounts, flatten them into one big list,
  // sort by date, and take the top 5.
  const recentActivity = currentAccounts
    .flatMap((acc: Account) => acc.transactions)
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Your financial health at a glance.
            </p>
          </div>

          <div className="text-right p-4 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-[200px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Net Worth
            </p>
            <p className="text-4xl font-black text-emerald-600">
              €{totalWealth.toLocaleString()}
            </p>
          </div>
        </div>

        {/* SECTION 1: MACRO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <WealthChart data={wealthData} />
          </div>
          <div className="md:col-span-2">
            <CashFlowChart data={cashFlowData} />
          </div>
        </div>

        {/* SECTION 2: MONTHLY FOCUS */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {monthName} <span className="text-slate-600">Focus</span>
              </h2>
            </div>
            <MonthFilter />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Expense Breakdown */}
            <div className="md:col-span-1 h-full min-h-[300px]">
              <ExpenseChart data={expenseData} />
            </div>

            {/* 2. Recent Activity Widget 🧾 */}
            <div className="md:col-span-2">
              <AppCard
                title="Recent Activity"
                subtitle="Last 5 Transactions"
                className="h-full"
                action={
                  <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    View All <ArrowRight size={12} />
                  </Link>
                }
              >
                {recentActivity.length > 0 ? (
                  <TransactionList
                    transactions={recentActivity}
                    categories={categories as Category[]}
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-sm italic">
                    No activity this month.
                  </div>
                )}
              </AppCard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
