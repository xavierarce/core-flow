import { AccountsService } from "@/services/accounts.service";
import {
  AppCard,
  TransactionList,
  WealthChart,
  CashFlowChart,
  AddTransactionDialog,
} from "@/components/shared";
import { MonthFilter } from "@/components/shared/MonthFilter";
import { calculateMonthlyCashFlow } from "@/lib/finance.utils";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Account } from "@/types";

interface HomeProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

const Home = async ({ searchParams }: HomeProps) => {
  // 1. Resolve Params (Next.js 15 requirement)
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();

  // 2. Define Dates
  // A. View Range (For the Transaction List: Just this month)
  const viewStart = startOfMonth(selectedDate).toISOString();
  const viewEnd = endOfMonth(selectedDate).toISOString();

  // B. Chart Range (For the Graphs: Last 6 Months)
  // We go back 5 months from TODAY so the trend is always relevant
  const chartStart = subMonths(new Date(), 5).toISOString();
  const chartEnd = endOfMonth(new Date()).toISOString();

  // 3. Fetch Data in Parallel
  // We need two datasets: one for the list (small), one for the chart (big)
  const [currentAccounts, trendAccounts] = await Promise.all([
    AccountsService.getAll(viewStart, viewEnd), // Dataset 1
    AccountsService.getAll(chartStart, chartEnd), // Dataset 2
  ]);

  // 4. Calculate Stats
  const totalWealth = AccountsService.calculateNetWorth(currentAccounts);

  // Wealth Chart (Pie) uses Current Snapshot
  const wealthData = currentAccounts.map((acc: Account) => ({
    name: acc.name,
    value: Number(acc.balance),
  }));

  // CashFlow Chart (Bar) uses Trend History (6 months)
  const cashFlowData = calculateMonthlyCashFlow(trendAccounts);

  return (
    <main className="min-h-screen bg-slate-50/50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Welcome back, Xavier</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-4">
            <MonthFilter />
            <AddTransactionDialog accounts={currentAccounts} />
          </div>

          <div className="text-right mt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Net Worth
            </p>
            <p className="text-4xl font-black text-emerald-600">
              €{totalWealth.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-6">
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <WealthChart data={wealthData} />
          </div>
          <div className="md:col-span-2">
            {/* ✅ Uses the 6-month trend data */}
            <CashFlowChart data={cashFlowData} />
          </div>
        </div>

        {/* Account List */}
        <h2 className="text-xl font-bold text-slate-800 mt-4">
          Activity for {selectedDate.toLocaleString("en-US", { month: "long" })}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentAccounts.map((account: Account) => (
            <AppCard
              key={account.id}
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
          ))}
        </div>
      </div>
    </main>
  );
};

export default Home;
