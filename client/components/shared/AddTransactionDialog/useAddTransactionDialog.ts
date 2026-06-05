"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { TransactionsService } from "@/services/transactions.service";
import { formSchema, type AddTransactionFormValues } from "./AddTransactionDialog.utils";
import type { AddTransactionDialogProps } from "./AddTransactionDialog.types";

export const useAddTransactionDialog = ({ accounts }: Pick<AddTransactionDialogProps, "accounts">) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  const form = useForm<AddTransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      accountId: accounts[0]?.id ?? "",
      categoryId: "uncategorized",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
    },
  });

  const onSubmit = async (values: AddTransactionFormValues) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await TransactionsService.create(token, {
        ...values,
        amount: parseFloat(values.amount),
        date: new Date(values.date).toISOString(),
        categoryId: values.categoryId === "uncategorized" ? undefined : values.categoryId,
      });

      setOpen(false);
      form.reset({
        description: "",
        amount: "",
        accountId: values.accountId,
        date: new Date().toISOString().split("T")[0],
        isRecurring: false,
      });
      toast.success("Transaction saved");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save transaction";
      toast.error(message);
      form.setError("root", { message });
    } finally {
      setIsLoading(false);
    }
  };

  return { open, setOpen, isLoading, form, onSubmit };
};
