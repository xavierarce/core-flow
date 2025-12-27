import { Transaction } from "@/types";
import { AppBadge } from "./AppBadge";

interface TransactionRowProps {
  transaction: Transaction;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
  const isNegative = Number(transaction.amount) < 0;

  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">
            {transaction.description}
          </span>
          {transaction.isRecurring && (
            <AppBadge className="bg-blue-50 text-blue-600 border-none">
              SUB
            </AppBadge>
          )}
        </div>
        <span className="text-[10px] text-slate-400">
          {new Date(transaction.date).toLocaleDateString()}
        </span>
      </div>

      <span
        className={`font-semibold ${
          isNegative ? "text-red-500" : "text-emerald-600"
        }`}
      >
        {isNegative ? "" : "+"}
        {transaction.amount}
      </span>
    </div>
  );
};
