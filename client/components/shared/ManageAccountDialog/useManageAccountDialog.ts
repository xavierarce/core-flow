"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AccountsService } from "@/services/accounts.service";
import { formSchema, type ManageAccountFormValues } from "./ManageAccountDialog.utils";
import type { ManageAccountDialogProps } from "./ManageAccountDialog.types";

/**
 * @hook useManageAccountDialog
 * Manages form state, submission, and deletion logic for the ManageAccountDialog.
 * @param account - Optional account for edit mode; omit for create mode.
 * @returns Form instance, open state, loading flags, and event handlers.
 */
export const useManageAccountDialog = ({ account }: ManageAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = !!account;
  const router = useRouter();
  const { getToken } = useAuth();

  const form = useForm<ManageAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account?.name ?? "",
      institution: account?.institution ?? "",
      type: account?.type ?? "CASH",
      initialBalance: "0",
    },
  });

  const onSubmit = async (values: ManageAccountFormValues) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      if (isEditing && account) {
        await AccountsService.update(token, account.id, {
          name: values.name,
          institution: values.institution,
          type: values.type,
        });
      } else {
        await AccountsService.create(token, {
          name: values.name,
          institution: values.institution,
          type: values.type,
          initialBalance: parseFloat(values.initialBalance ?? "0"),
        });
      }
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save account";
      form.setError("root", { message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    if (!confirm("Are you sure? This will delete the account and ALL its transactions. This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await AccountsService.delete(token, account.id);
      setOpen(false);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete account";
      form.setError("root", { message });
    } finally {
      setIsDeleting(false);
    }
  };

  return { open, setOpen, isLoading, isDeleting, isEditing, form, onSubmit, handleDelete };
};
