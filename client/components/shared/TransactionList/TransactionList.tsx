import { TransactionRow } from "../TransactionRow/TransactionRow";
import type { TransactionListProps } from "./TransactionList.types";

/**
 * @component TransactionList
 * Renders a list of transaction rows or an empty state message.
 * @param transactions - Array of transactions to display.
 * @param categories - Array of categories for categorization selects.
 */
export const TransactionList = ({
  transactions,
  categories,
}: TransactionListProps) => (
  <div className="border-t border-border pt-2 mt-2">
    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
      Recent Activity
    </h3>
    <div className="space-y-2">
      {transactions.length > 0 ? (
        transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} categories={categories} />
        ))
      ) : (
        <p className="text-muted-foreground italic text-xs">No transactions found</p>
      )}
    </div>
  </div>
);
