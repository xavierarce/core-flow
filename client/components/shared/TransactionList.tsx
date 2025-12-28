import { Transaction, Category } from "@/types";
import { TransactionRow } from "./TransactionRow";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
}

export const TransactionList = ({
  transactions,
  categories,
}: TransactionListProps) => {
  return (
    <div className="border-t border-slate-300 pt-2 mt-2">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
        Recent Activity
      </h3>

      <div className="space-y-2">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              categories={categories}
            />
          ))
        ) : (
          <p className="text-slate-400 italic text-xs">No transactions found</p>
        )}
      </div>
    </div>
  );
};
