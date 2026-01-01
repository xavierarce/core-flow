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
import { CsvImporter } from "@/components/shared/CsvImporter";
import { ManageAccountDialog } from "@/components/shared/ManageAccountDialog";

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
  // Filter accounts for the dropdowns
  const manualAccounts = currentAccounts.filter(
    (acc: Account) => !acc.isAutomated
  );

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Financial overview for Xavier
            </p>
          </div>

          <div className="text-right p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Net Worth
            </p>
            <p className="text-4xl font-black text-emerald-600">
              €{totalWealth.toLocaleString()}
            </p>
          </div>
        </div>

        {/* --- SECTION 1: GLOBAL TRENDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <WealthChart data={wealthData} />
          </div>
          <div className="md:col-span-2">
            <CashFlowChart data={cashFlowData} />
          </div>
        </div>

        {/* --- SECTION 2: MONTHLY FOCUS --- */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {monthName} <span className="text-slate-600">Activity</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Deep dive into expenses and income
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <MonthFilter />
              <div className="w-px h-6 bg-slate-200 mx-1" />

              {/* Only pass MANUAL accounts to these tools */}
              <CsvImporter accounts={manualAccounts} />
              <AddTransactionDialog
                accounts={manualAccounts}
                categories={categories as Category[]}
              />

              {/* New Button to Create Account */}
              <ManageAccountDialog />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Expense Chart */}
            <div className="md:col-span-1 h-full">
              <ExpenseChart data={expenseData} />
            </div>

            {/* 2. Account Transaction Lists */}
            {currentAccounts.map((account: Account) => (
              <div key={account.id} className="md:col-span-1">
                <AppCard
                  title={account.name}
                  subtitle={account.institution}
                  // Add the Edit button to the card header
                  action={<ManageAccountDialog account={account} />}
                  extraHeader={
                    <div className="text-xl font-bold text-slate-700 font-mono tracking-tight">
                      {account.currency === "USD" ? "$" : "€"}
                      {Number(account.balance).toLocaleString()}
                    </div>
                  }
                >
                  <TransactionList
                    transactions={account.transactions}
                    categories={categories as Category[]}
                  />
                </AppCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
