import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";
import { WealthChart, CashFlowChart } from "@/components/shared";
import { ExpenseChart } from "@/components/shared/ExpenseChart";
import { MonthFilter } from "@/components/shared/MonthFilter";
import {
  calculateMonthlyCashFlow,
  calculateExpenseBreakdown,
} from "@/lib/finance.utils";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Account } from "@/types";

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

  // Dates
  const viewStart = startOfMonth(selectedDate).toISOString();
  const viewEnd = endOfMonth(selectedDate).toISOString();
  const chartStart = subMonths(new Date(), 5).toISOString();
  const chartEnd = endOfMonth(new Date()).toISOString();

  // 1. Fetch Data (Only what is needed for charts)
  const [currentAccounts, trendAccounts] = await Promise.all([
    AccountsService.getAll(token, viewStart, viewEnd),
    AccountsService.getAll(token, chartStart, chartEnd),
  ]);

  // 2. Calculate Executive Metrics
  const totalWealth = AccountsService.calculateNetWorth(currentAccounts);

  const wealthData = currentAccounts.map((acc: Account) => ({
    name: acc.name,
    value: Number(acc.balance),
  }));

  const cashFlowData = calculateMonthlyCashFlow(trendAccounts);
  const expenseData = calculateExpenseBreakdown(currentAccounts);

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="p-8 max-w-7xl mx-auto space-y-12">
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

        {/* SECTION 1: MACRO TRENDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wealth Distribution */}
          <div className="md:col-span-1">
            <WealthChart data={wealthData} />
          </div>
          {/* Cashflow Trend (Income vs Expense) */}
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
            {/* Simple date filter, no heavy buttons */}
            <MonthFilter />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Expense Breakdown */}
            <div className="md:col-span-1 h-full min-h-[300px]">
              <ExpenseChart data={expenseData} />
            </div>

            {/* Placeholder for "Recent Transactions" (We will build this widget later) */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-400">
              <p>Recent Activity Widget coming here...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
