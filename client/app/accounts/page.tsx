import { auth } from "@clerk/nextjs/server";
import { AccountsService } from "@/services/accounts.service";
import { AppCard } from "@/components/shared";
import { Account } from "@/types";
import { ManageAccountDialog } from "@/components/shared/ManageAccountDialog";
import { Wallet, Building2, TrendingUp } from "lucide-react"; // Icons

export default async function AccountsPage() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  // We don't need dates here, just the account metadata
  const accounts = await AccountsService.getAll(token);

  // Helper to pick icon based on type
  const getIcon = (type: string) => {
    if (type === "INVESTMENT")
      return <TrendingUp className="text-purple-500" />;
    if (type === "SAVINGS") return <Building2 className="text-blue-500" />;
    return <Wallet className="text-emerald-500" />;
  };

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Accounts</h1>
            <p className="text-slate-500 mt-1">
              Configure your banks and connections.
            </p>
          </div>
          {/* The ONLY Action: Create/Edit Accounts */}
          <ManageAccountDialog />
        </div>

        {/* ACCOUNTS GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account: Account) => (
            <div key={account.id}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {getIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {account.name}
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        {account.institution}
                      </p>
                    </div>
                  </div>
                  {/* Edit/Delete Button */}
                  <ManageAccountDialog account={account} />
                </div>

                {/* Card Body: Just the Balance */}
                <div className="mb-4">
                  <p className="text-sm text-slate-400 font-medium">
                    Current Balance
                  </p>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    {account.currency === "USD" ? "$" : "€"}
                    {Number(account.balance).toLocaleString()}
                  </p>
                </div>

                {/* Card Footer: Metadata */}
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      account.isAutomated
                        ? "bg-blue-50 text-blue-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {account.isAutomated ? "SYNCED" : "MANUAL"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {account.type}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add New Card */}
          {accounts.length === 0 && (
            <div className="md:col-span-3 text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 mb-4">No accounts found.</p>
              <ManageAccountDialog />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
