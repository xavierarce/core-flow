"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Transaction, Category } from "@/types";
import { AppBadge } from "./AppBadge";
import { TransactionsService } from "@/services/transactions.service";
import { AppButton } from "./AppButton";
import { AppSelect } from "./AppSelect";

interface TransactionRowProps {
  transaction: Transaction;
  categories: Category[];
}

export const TransactionRow = ({
  transaction,
  categories,
}: TransactionRowProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isNegative = Number(transaction.amount) < 0;
  const dateObj = new Date(transaction.date);
  const isDeletable = transaction.source === "MANUAL";

  const currentCategory = transaction.category;
  const badgeColor = currentCategory?.color || "#64748b";
  const badgeBg = currentCategory ? `${currentCategory.color}20` : "#f1f5f9";

  // Transform categories to AppSelect options format
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    label: c.name,
    color: c.color,
  }));

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

  const handleCategoryChange = async (newCategoryId: string) => {
    setIsUpdating(true);
    try {
      await TransactionsService.update(transaction.id, {
        categoryId: newCategoryId,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update category", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`
        group relative flex justify-between items-center text-sm rounded-lg transition-colors hover:bg-slate-50
        pl-2 py-2 pr-10
        ${isDeleting ? "opacity-50" : ""}
      `}
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">
            {transaction.description}
          </span>

          {/* 👇 INTERACTIVE BADGE */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            // Force container to wrap tightly
            className="h-6 flex items-center"
          >
            <AppSelect
              variant="badge"
              value={transaction.categoryId || ""}
              onChange={handleCategoryChange}
              options={categoryOptions}
              disabled={isUpdating}
              placeholder="Uncategorized"
              className="gap-0"
              triggerClassName="px-2 py-[2px] text-[10px] rounded-full font-medium transition-opacity hover:opacity-80 min-w-[fit-content]"
              triggerStyle={{
                backgroundColor: badgeBg,
                color: badgeColor,
                height: "fit-content",
              }}
            />
          </div>

          {transaction.isRecurring && (
            <AppBadge className="bg-blue-50 text-blue-600 border-none">
              SUB
            </AppBadge>
          )}
        </div>
        <span className="text-[10px] text-slate-400">
          {dateObj.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center">
        <span
          className={`font-semibold ${
            isNegative ? "text-red-500" : "text-emerald-600"
          }`}
        >
          {isNegative ? "" : "+"}
          {transaction.amount}
        </span>

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
