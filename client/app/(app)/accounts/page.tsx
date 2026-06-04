import { auth } from "@clerk/nextjs/server";

import { AccountsService } from "@/services/accounts.service";
import { Account } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { AccountCard } from "@/components/features/accounts/AccountCard";
import { ManageAccountDialog } from "@/components/shared/ManageAccountDialog";

export default async function AccountsPage() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const accounts: Array<Account> = await AccountsService.getAll(token);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounts"
        subtitle="Configure your banks and connections."
        action={<ManageAccountDialog />}
      />

      {accounts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 mb-4">No accounts found.</p>
          <ManageAccountDialog />
        </div>
      )}
    </div>
  );
}
