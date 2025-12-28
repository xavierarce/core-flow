import { AccountsService } from "@/services/accounts.service";
import { CategoriesService } from "@/services/categories.service";
import {
  AppCard,
  TransactionList,
  WealthChart,
  CashFlowChart,
  AddTransactionDialog,
} from "@/components/shared";
import { ExpenseChart } from "@/components/shared/ExpenseChart";
import { MonthFilter } from "@/components/shared/MonthFilter";
import {
  calculateMonthlyCashFlow,
  calculateExpenseBreakdown,
} from "@/lib/finance.utils";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Account, Category } from "@/types";

interface HomeProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

const Home = async ({ searchParams }: HomeProps) => {
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();
  const monthName = selectedDate.toLocaleString("en-US", { month: "long" });

  // Dates
  const viewStart = startOfMonth(selectedDate).toISOString();
  const viewEnd = endOfMonth(selectedDate).toISOString();
  const chartStart = subMonths(new Date(), 5).toISOString();
  const chartEnd = endOfMonth(new Date()).toISOString();

  // Fetch Data
  const [currentAccounts, trendAccounts, categories] = await Promise.all([
    AccountsService.getAll(viewStart, viewEnd),
    AccountsService.getAll(chartStart, chartEnd),
    CategoriesService.getAll(),
  ]);

  // Calc Stats
  const totalWealth = AccountsService.calculateNetWorth(currentAccounts);

  const wealthData = currentAccounts.map((acc: Account) => ({
    name: acc.name,
    value: Number(acc.balance),
  }));

  const cashFlowData = calculateMonthlyCashFlow(trendAccounts);
  const expenseData = calculateExpenseBreakdown(currentAccounts);

  return (
    <main className="min-h-screen bg-slate-50/50 p-8">
      {/* --- SECTION 1: GLOBAL OVERVIEW (Static / Trends) --- */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm">Welcome back, Xavier</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Net Worth
            </p>
            <p className="text-4xl font-black text-emerald-600">
              €{totalWealth.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <WealthChart data={wealthData} />
          </div>
          <div className="md:col-span-2">
            <CashFlowChart data={cashFlowData} />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="max-w-6xl mx-auto border-t border-slate-200 my-10" />

      {/* --- SECTION 2: MONTHLY FOCUS (Dynamic) --- */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {monthName} Overview
            </h2>
            <p className="text-slate-500 text-sm">
              Expenses and activity for this month
            </p>
          </div>

          {/* 👇 CONTROLS MOVED HERE - Closer to the data they affect */}
          <div className="flex items-center gap-3">
            <MonthFilter />
            <AddTransactionDialog
              accounts={currentAccounts}
              categories={categories as Category[]}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Expense Chart (First item in the grid) */}
          <div className="md:col-span-1">
            <ExpenseChart data={expenseData} />
          </div>

          {/* 2. Transaction Lists (Next to it) */}
          {currentAccounts.map((account: Account) => (
            <div key={account.id} className="md:col-span-1">
              <AppCard
                title={account.name}
                subtitle={account.institution}
                extraHeader={
                  <div className="text-2xl font-bold text-slate-700">
                    {account.currency === "USD" ? "$" : "€"}
                    {account.balance}
                  </div>
                }
              >
                <TransactionList transactions={account.transactions} />
              </AppCard>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Home;
