import { Account } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AccountsService = {
  /**
   * Fetches all accounts with their transactions.
   * Mirrors the NestJS AccountsController.findAll()
   */
  getAll: async (
    orderBy: "name" | "balance" = "name",
    transactionsOrder: "asc" | "desc" = "desc"
  ): Promise<Account[]> => {
    if (!API_URL) throw new Error("API URL missing");

    const params = new URLSearchParams({
      orderBy,
      transactionsOrder,
    });

    const res = await fetch(`${API_URL}/accounts?${params}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("API Error");
    return await res.json();
  },

  /**
   * Calculate total net worth helper
   * Business logic stays out of the UI!
   */
  calculateNetWorth: (accounts: Account[]): number =>
    accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
};
