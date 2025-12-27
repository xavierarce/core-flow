import { AccountsService } from "../services/accounts.service";

/**
 * The Wealth Dashboard Homepage.
 * * This is a React Server Component (RSC) that fetches financial data
 * server-side and renders the user's net worth and account details.
 * * @async
 * @returns {Promise<JSX.Element>} The rendered dashboard page.
 */
export const Home = async () => {
  // 1. Fetch data: The Service handles the API communication and error logic.
  const accounts = await AccountsService.getAll();

  // 2. Business Logic: Calculate total wealth using the Service helper.
  const totalWealth = AccountsService.calculateNetWorth(accounts);

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* --- Header Section --- */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Wealth Dashboard
          </h1>
          <p className="text-slate-500">Core-Flow Financial Overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400 uppercase tracking-wider">
            Net Worth
          </p>
          <p className="text-4xl font-extrabold text-emerald-600">
            €{totalWealth.toLocaleString()}
          </p>
        </div>
      </div>

      {/* --- Accounts Grid --- */}
      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
          >
            {/* Account Card Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {account.name}
                </h2>
                <span className="text-sm text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
                  {account.institution}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-700">
                {account.currency === "USD" ? "$" : "€"}
                {account.balance}
              </p>
            </div>

            {/* Transactions List */}
            <div className="border-t border-slate-50 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {account.transactions.length > 0 ? (
                  account.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">
                          {tx.description}
                        </span>
                        {/* Subscription Badge logic */}
                        {tx.isRecurring && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            SUB
                          </span>
                        )}
                      </div>
                      <span
                        className={
                          Number(tx.amount) < 0
                            ? "text-red-500"
                            : "text-emerald-500 font-medium"
                        }
                      >
                        {tx.amount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-sm">
                    No transactions found
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Home;
