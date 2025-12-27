"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionsService } from "@/services/transactions.service";
import { Account } from "@/types";

interface AddTransactionDialogProps {
  accounts: Account[]; // We need the list of accounts to populate the dropdown
}

export function AddTransactionDialog({ accounts }: AddTransactionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    accountId: accounts[0]?.id || "", // Default to first account
    date: new Date().toISOString().split("T")[0], // Today yyyy-mm-dd
    isRecurring: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await TransactionsService.create({
        ...formData,
        amount: parseFloat(formData.amount), // Convert string to number
        date: new Date(formData.date).toISOString(),
      });

      setOpen(false); // Close modal
      setFormData({ ...formData, description: "", amount: "" }); // Reset form
      router.refresh(); // ✨ Refresh Server Components to show new data instantly!
    } catch (error) {
      console.error(error);
      alert("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white">
          + Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Grocery Store"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          {/* Amount & Account Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="-15.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account">Account</Label>
              <Select
                value={formData.accountId}
                onValueChange={(val) =>
                  setFormData({ ...formData, accountId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          {/* Recurring Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isRecurring: checked as boolean })
              }
            />
            <Label
              htmlFor="recurring"
              className="text-sm font-medium leading-none"
            >
              This is a recurring subscription
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? "Saving..." : "Save Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
