import { Account } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AccountsService = {
  /**
   * Fetches all accounts with their transactions.
   * Mirrors the NestJS AccountsController.findAll()
   */
  getAll: async (): Promise<Account[]> => {
    if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not defined");

    try {
      const res = await fetch(`${API_URL}/accounts`, {
        cache: "no-store",
        next: { tags: ["accounts"] },
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      throw error;
    }
  },

  /**
   * Calculate total net worth helper
   * Business logic stays out of the UI!
   */
  calculateNetWorth: (accounts: Account[]): number =>
    accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
};
