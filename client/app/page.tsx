import { AccountsService } from "@/services/accounts.service";
import {
  AppCard,
  TransactionList,
  WealthChart,
  CashFlowChart,
  AddTransactionDialog,
} from "@/components/shared";
import { calculateMonthlyCashFlow } from "@/lib/finance.utils"; // Import helper

const Home = async () => {
  const accounts = await AccountsService.getAll();
  const totalWealth = AccountsService.calculateNetWorth(accounts);

  // 1. Prepare Pie Chart Data
  const wealthData = accounts.map((acc) => ({
    name: acc.name,
    value: parseFloat(acc.balance),
  }));

  // 2. Prepare Bar Chart Data
  const cashFlowData = calculateMonthlyCashFlow(accounts);

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
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Net Worth
            </p>
            <p className="text-4xl font-black text-emerald-600">
              €{totalWealth.toLocaleString()}
            </p>
            <AddTransactionDialog accounts={accounts} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-6">
        {/* Row 1: The Analytics Section (Charts) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pie Chart (1/3 width) */}
          <div className="md:col-span-1">
            <WealthChart data={wealthData} />
          </div>

          {/* Bar Chart (2/3 width) */}
          <div className="md:col-span-2">
            <CashFlowChart data={cashFlowData} />
          </div>
        </div>

        {/* Row 2: Account List */}
        <h2 className="text-xl font-bold text-slate-800 mt-4">Your Accounts</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
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
