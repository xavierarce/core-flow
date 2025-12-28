"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TransactionsService } from "@/services/transactions.service";
import { Account, Category } from "@/types"; // Import Category

import { AppInput, AppSelect, AppButton, AppDialog, AppCheckbox } from "./";

interface AddTransactionDialogProps {
  accounts: Account[];
  categories: Category[]; // 👈 Added categories prop
}

export function AddTransactionDialog({
  accounts,
  categories,
}: AddTransactionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    accountId: accounts[0]?.id || "",
    categoryId: "", // 👈 Added categoryId to state
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await TransactionsService.create({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        categoryId: formData.categoryId || undefined,
      });

      setOpen(false);
      // Reset form (keeping account as default is usually better UX)
      setFormData({
        ...formData,
        description: "",
        amount: "",
        categoryId: "",
        isRecurring: false,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare options for AppSelect
  const accountOptions = accounts.map((acc) => ({
    id: acc.id,
    label: acc.name,
  }));

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    label: cat.name, // AppSelect usually handles text labels
  }));

  return (
    <AppDialog
      title="Add Transaction"
      open={open}
      onOpenChange={setOpen}
      trigger={<AppButton variantType="secondary">+ Add Transaction</AppButton>}
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Row 1: Description & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppInput
            label="Description"
            placeholder="e.g. Grocery Store"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />

          <AppSelect
            label="Category"
            value={formData.categoryId}
            onChange={(val) => setFormData({ ...formData, categoryId: val })}
            options={categoryOptions}
            placeholder="Select Category"
          />
        </div>

        {/* Row 2: Amount & Account */}
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Amount (€)"
            type="number"
            step="0.01"
            placeholder="-15.00"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            required
          />

          <AppSelect
            label="Account"
            value={formData.accountId}
            onChange={(val) => setFormData({ ...formData, accountId: val })}
            options={accountOptions}
          />
        </div>

        {/* Row 3: Date */}
        <AppInput
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        {/* Checkbox */}
        <AppCheckbox
          id="recurring"
          label="This is a recurring subscription"
          checked={formData.isRecurring}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isRecurring: checked })
          }
        />

        <AppButton
          type="submit"
          disabled={isLoading}
          variantType="primary"
          className="mt-2 w-full"
        >
          {isLoading ? "Saving..." : "Save Transaction"}
        </AppButton>
      </form>
    </AppDialog>
  );
}
