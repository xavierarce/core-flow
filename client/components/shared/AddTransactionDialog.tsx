"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TransactionsService } from "@/services/transactions.service";
import { Account } from "@/types";

import { AppInput, AppSelect, AppButton, AppDialog } from "./";

interface AddTransactionDialogProps {
  accounts: Account[];
}

export function AddTransactionDialog({ accounts }: AddTransactionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    accountId: accounts[0]?.id || "",
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
      });
      setOpen(false);
      setFormData({ ...formData, description: "", amount: "" });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const accountOptions = accounts.map((acc) => ({
    id: acc.id,
    label: acc.name,
  }));

  return (
    <AppDialog
      title="Add Transaction"
      open={open}
      onOpenChange={setOpen}
      trigger={<AppButton variantType="secondary">+ Add Transaction</AppButton>}
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <AppInput
          label="Description"
          placeholder="e.g. Grocery Store"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />

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

        <AppInput
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        {/* Checkbox Wrapper logic could be added to AppInput later if needed */}
        <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-md border border-slate-100">
          <Checkbox
            id="recurring"
            checked={formData.isRecurring}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isRecurring: checked as boolean })
            }
          />
          <Label
            htmlFor="recurring"
            className="text-sm font-medium cursor-pointer"
          >
            This is a recurring subscription
          </Label>
        </div>

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
