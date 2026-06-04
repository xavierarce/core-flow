import { auth } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service";
import { calculateMonthlyCashFlow, calculateExpenseBreakdown } from "@/lib/finance.utils";
import { Account, Category, Transaction } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { AppCard, WealthChart, CashFlowChart, TransactionList, MonthFilter, ExpenseChart } from "@/components/shared";

interface DashboardProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
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

  const [currentAccounts, trendAccounts, categories] = await Promise.all([
    AccountsService.getAll(token, viewStart, viewEnd),
    AccountsService.getAll(token, chartStart, chartEnd),
    CategoriesService.getAll(token),
  ]);

  const totalWealth = AccountsService.calculateNetWorth(currentAccounts);
  const wealthData = currentAccounts.map((acc: Account) => ({
    name: acc.name,
    value: Number(acc.balance),
  }));
  const cashFlowData = calculateMonthlyCashFlow(trendAccounts);
  const expenseData = calculateExpenseBreakdown(currentAccounts);
  const recentActivity = currentAccounts
    .flatMap((acc: Account) => acc.transactions)
    .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-12">
      <PageHeader
        title="Dashboard"
        subtitle="Your financial health at a glance."
        action={
          <div className="text-right p-4 bg-card rounded-2xl border border-border shadow-sm min-w-[200px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Total Net Worth
            </p>
            <p className="text-4xl font-black text-emerald-500">
              €{totalWealth.toLocaleString()}
            </p>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <WealthChart data={wealthData} />
        </div>
        <div className="md:col-span-2">
          <CashFlowChart data={cashFlowData} />
        </div>
      </div>

      <div className="pt-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {monthName} <span className="text-slate-600">Focus</span>
          </h2>
          <MonthFilter />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-1 h-full min-h-[300px]">
            <ExpenseChart data={expenseData} />
          </div>

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
                  categories={categories as Array<Category>}
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
  );
}
