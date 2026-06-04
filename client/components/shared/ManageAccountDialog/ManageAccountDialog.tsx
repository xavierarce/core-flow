"use client";

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
import { PlusCircle, Settings2, Loader2, Trash2 } from "lucide-react";
import { AppButton } from "../AppButton/AppButton";
import { useManageAccountDialog } from "./useManageAccountDialog";
import type { ManageAccountDialogProps } from "./ManageAccountDialog.types";

/**
 * @component ManageAccountDialog
 * Dialog for creating or editing an account. Supports delete in edit mode.
 * @param account - If provided, opens in edit mode pre-filled with account data.
 */
export const ManageAccountDialog = ({ account }: ManageAccountDialogProps) => {
  const {
    open,
    setOpen,
    isLoading,
    isDeleting,
    isEditing,
    form,
    onSubmit,
    handleDelete,
  } = useManageAccountDialog({ account });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <AppButton
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Settings2 size={16} />
          </AppButton>
        ) : (
          <AppButton variantType="primary" className="gap-2 shadow-sm">
            <PlusCircle size={16} /> New Account
          </AppButton>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
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
                    <SelectContent className="bg-card">
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
                    <p className="text-[10px] text-muted-foreground">
                      Sets your starting net worth for this account.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEditing && account?.isAutomated && (
              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs p-3 rounded flex gap-2">
                <span>⚠️</span>
                <span>
                  This account is synced automatically. Balances update via API.
                </span>
              </div>
            )}

            {form.formState.errors.root && (
              <p className="text-xs text-error">
                {form.formState.errors.root.message}
              </p>
            )}

            <AppButton
              type="submit"
              variantType="primary"
              className="w-full"
              disabled={isLoading || isDeleting}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Account"}
            </AppButton>

            {isEditing && (
              <div className="pt-4 border-t border-border mt-4">
                <AppButton
                  type="button"
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                  onClick={handleDelete}
                  disabled={isLoading || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete Account
                </AppButton>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
