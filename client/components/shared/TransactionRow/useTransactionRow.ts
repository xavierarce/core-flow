"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { TransactionsService } from "@/services/transactions.service";
import type { TransactionRowProps } from "./TransactionRow.types";

/**
 * @hook useTransactionRow
 * Manages delete and category-update actions for a single transaction row.
 * @param transaction - The transaction being managed.
 * @returns Loading flags and event handlers for deletion and category changes.
 */
export const useTransactionRow = ({
  transaction,
}: Pick<TransactionRowProps, "transaction">) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this?")) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await TransactionsService.delete(token, transaction.id);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleCategoryChange = async (newCategoryId: string) => {
    setIsUpdating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await TransactionsService.update(token, transaction.id, {
        categoryId: newCategoryId,
      });
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  return { isDeleting, isUpdating, handleDelete, handleCategoryChange };
};
