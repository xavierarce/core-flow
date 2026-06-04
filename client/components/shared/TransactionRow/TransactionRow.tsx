"use client";

import { Trash2 } from "lucide-react";
import { AppBadge } from "../AppBadge/AppBadge";
import { AppButton } from "../AppButton/AppButton";
import { AppSelect } from "../AppSelect/AppSelect";
import { useTransactionRow } from "./useTransactionRow";
import type { TransactionRowProps } from "./TransactionRow.types";

/**
 * @component TransactionRow
 * Single transaction row with inline category select and delete action.
 * @param transaction - The transaction data to display.
 * @param categories - Available categories for the category select.
 */
export const TransactionRow = ({
  transaction,
  categories,
}: TransactionRowProps) => {
  const { isDeleting, isUpdating, handleDelete, handleCategoryChange } =
    useTransactionRow({ transaction });

  const isNegative = Number(transaction.amount) < 0;
  const dateObj = new Date(transaction.date);
  const isDeletable = transaction.source === "MANUAL";

  const currentCategory = transaction.category;
  const badgeColor = currentCategory?.color ?? "#64748b";
  const badgeBg = currentCategory ? `${currentCategory.color}20` : "#f1f5f9";

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    label: c.name,
    color: c.color,
  }));

  return (
    <div
      className={`
        group relative flex justify-between items-center text-sm rounded-lg transition-colors hover:bg-muted/40
        pl-2 py-2 pr-10
        ${isDeleting ? "opacity-50" : ""}
      `}
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">
            {transaction.description}
          </span>

          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="h-6 flex items-center"
          >
            <AppSelect
              variant="badge"
              value={transaction.categoryId ?? ""}
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
        <span className="text-[10px] text-muted-foreground">
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
              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 size={15} />
            </AppButton>
          </div>
        )}
      </div>
    </div>
  );
};
