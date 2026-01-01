"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account } from "@/types";
import { PlusCircle, Settings2, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AccountsService } from "@/services/accounts.service"; // 👈 Use the service!

// 1. Define the Schema with Zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  institution: z.string().min(2, "Institution is required"),
  type: z.enum([
    "CASH",
    "SAVINGS",
    "INVESTMENT",
    "TRADING",
    "CRYPTO",
    "REAL_ESTATE",
  ]),
  // initialBalance is a string in the form, but we convert it later
  initialBalance: z.string().optional(),
});

interface ManageAccountDialogProps {
  account?: Account; // If provided, we are in "Edit Mode"
}

export const ManageAccountDialog = ({ account }: ManageAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // 👈 New stateconst router = useRouter();
  const isEditing = !!account;
  const router = useRouter();

  // 2. Setup Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account?.name || "",
      institution: account?.institution || "",
      // Cast type to ensure it matches the enum options
      type: (account?.type as any) || "CASH",
      initialBalance: "0",
    },
  });

  // 3. Handle Submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isEditing && account) {
        // UPDATE MODE
        await AccountsService.update(account.id, {
          name: values.name,
          institution: values.institution,
          type: values.type,
        });
      } else {
        // CREATE MODE
        await AccountsService.create({
          name: values.name,
          institution: values.institution,
          type: values.type,
          initialBalance: parseFloat(values.initialBalance || "0"),
        });
      }

      setOpen(false);
      form.reset();
      router.refresh(); // Refresh data on page
    } catch (error) {
      console.error(error);
      // Ideally, show a Toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    // Simple native confirm for now (or use a custom Alert Dialog if you prefer)
    if (
      !confirm(
        "Are you sure? This will delete the account and ALL its transactions. This cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await AccountsService.delete(account.id);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-900"
          >
            <Settings2 size={16} />
          </Button>
        ) : (
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
            <PlusCircle size={16} /> New Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? "Edit Account" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* INSTITUTION */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider / Bank</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Binance, Chase, Ledger"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TYPE */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="CASH">Cash / Bank</SelectItem>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="INVESTMENT">Investment</SelectItem>
                      <SelectItem value="CRYPTO">Crypto Wallet</SelectItem>
                      <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* INITIAL BALANCE (Only for Creation) */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Balance (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <p className="text-[10px] text-slate-500">
                      Sets your starting net worth for this account.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Warning for Automated Accounts */}
            {isEditing && account?.isAutomated && (
              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs p-3 rounded flex gap-2">
                <span>⚠️</span>
                <span>
                  This account is synced automatically. Balances update via API.
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800"
              disabled={isLoading || isDeleting}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Account"}
            </Button>

            {/* 👇 DANGER ZONE: Only show when Editing */}
            {isEditing && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                <Button
                  type="button" // Important: type="button" so it doesn't submit the form
                  variant="ghost"
                  className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
                  onClick={handleDelete}
                  disabled={isLoading || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete Account
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
