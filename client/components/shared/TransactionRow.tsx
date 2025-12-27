"use client"; // <--- Now interactive

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react"; // Icon
import { Transaction } from "@/types";
import { AppBadge } from "./AppBadge";
import { TransactionsService } from "@/services/transactions.service";

interface TransactionRowProps {
  transaction: Transaction;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const isNegative = Number(transaction.amount) < 0;
  const dateObj = new Date(transaction.date);
  const isDeletable = transaction.source === "MANUAL";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this?")) return;

    setIsDeleting(true);
    try {
      await TransactionsService.delete(transaction.id);
      router.refresh(); // Refresh the list and charts
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group flex justify-between items-center text-sm p-2 rounded-lg transition-colors hover:bg-slate-50 ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
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
          {dateObj.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`font-semibold ${
            isNegative ? "text-red-500" : "text-emerald-600"
          }`}
        >
          {isNegative ? "" : "+"}
          {transaction.amount}
        </span>

        {isDeletable && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete Transaction"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
