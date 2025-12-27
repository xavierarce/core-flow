import { AccountsService } from "@/services/accounts.service";
import { AppCard, TransactionList, WealthChart } from "@/components/shared"; // Import WealthChart

/**
 * Wealth Dashboard
 */
const Home = async () => {
  const accounts = await AccountsService.getAll();
  const totalWealth = AccountsService.calculateNetWorth(accounts);

  // Prepare data for the chart
  const chartData = accounts.map((acc) => ({
    name: acc.name,
    value: parseFloat(acc.balance),
  }));

  return (
    <main className="min-h-screen bg-slate-50/50 p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-end">
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

      <div className="max-w-5xl mx-auto grid gap-6">
        {/* Row 1: The Chart (Full Width) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart takes up 1 column on large screens, or maybe logic to be flexible */}
          <div className="md:col-span-1">
            <WealthChart data={chartData} />
          </div>

          {/* We can leave space for other widgets later, or make chart full width */}
          <div className="md:col-span-2 flex items-center justify-center bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
            <p className="text-slate-400 text-sm italic">
              More widgets coming soon...
            </p>
          </div>
        </div>

        {/* Row 2: Account List */}
        <h2 className="text-xl font-bold text-slate-800 mt-4">Your Accounts</h2>
        <div className="grid gap-6 md:grid-cols-2">
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
