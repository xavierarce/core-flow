import { AccountsService } from "@/services/accounts.service";
import { AppCard, TransactionList } from "@/components/shared";

/**
 * Wealth Dashboard
 * Architecture: Clean Component Composition
 */
const Home = async () => {
  const accounts = await AccountsService.getAll();
  const totalWealth = AccountsService.calculateNetWorth(accounts);

  return (
    <main className="min-h-screen bg-slate-50/50 p-8">
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

      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
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
    </main>
  );
};

export default Home;
