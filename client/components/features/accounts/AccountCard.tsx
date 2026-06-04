import type { Account } from "@/types";
import { ManageAccountDialog } from "@/components/shared";
import { getAccountIcon, formatBalance } from "@/lib/account.utils";

interface AccountCardProps {
  account: Account;
}

export const AccountCard = ({ account }: AccountCardProps) => (
  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-3 items-center">
        <div className="p-2 bg-muted rounded-lg border border-border">
          {getAccountIcon(account.type)}
        </div>
        <div>
          <h3 className="font-bold text-foreground">{account.name}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {account.institution}
          </p>
        </div>
      </div>
      <ManageAccountDialog account={account} />
    </div>

    <div className="mb-4">
      <p className="text-sm text-muted-foreground font-medium">Current Balance</p>
      <p className="text-3xl font-bold text-foreground tracking-tight">
        {formatBalance(account.balance, account.currency)}
      </p>
    </div>

    <div className="pt-4 border-t border-border flex gap-2">
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
          account.isAutomated
            ? "bg-blue-500/15 text-blue-400"
            : "bg-amber-500/15 text-amber-400"
        }`}
      >
        {account.isAutomated ? "SYNCED" : "MANUAL"}
      </span>
      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
        {account.type}
      </span>
    </div>
  </div>
);
