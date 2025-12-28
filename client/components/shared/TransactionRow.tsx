"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Transaction } from "@/types";
import { AppBadge } from "./AppBadge";
import { TransactionsService } from "@/services/transactions.service";
import { AppButton } from "./AppButton";

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
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`
        group relative flex justify-between items-center text-sm rounded-lg transition-colors hover:bg-slate-50
        pl-2 py-2 pr-10 /* 👈 Fixed right padding reserves space for the button on ALL rows */
        ${isDeleting ? "opacity-50" : ""}
      `}
    >
      {/* LEFT: Description */}
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

      {/* RIGHT: Amount & Absolute Button */}
      <div className="flex items-center">
        <span
          className={`font-semibold ${
            isNegative ? "text-red-500" : "text-emerald-600"
          }`}
        >
          {isNegative ? "" : "+"}
          {transaction.amount}
        </span>

        {/* ABSOLUTE POSITIONING:
            The button floats in the padding area (pr-10) we created above.
            It does not affect the flex layout, so amounts never jump.
        */}
        {isDeletable && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <AppButton
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete Transaction"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <Trash2 size={15} />
            </AppButton>
          </div>
        )}
      </div>
    </div>
  );
};
