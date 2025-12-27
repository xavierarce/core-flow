import { Account } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AccountsService = {
  /**
   * Fetches all accounts with their transactions.
   * Mirrors the NestJS AccountsController.findAll()
   */
  async getAll(start?: string, end?: string) {
    // Build the URL with query params
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const res = await fetch(`${API_URL}/accounts?${params.toString()}`, {
      cache: "no-store", // Ensure fresh data on every request
    });

    if (!res.ok) throw new Error("Failed to fetch accounts");
    return res.json();
  },

  /**
   * Calculate total net worth helper
   * Business logic stays out of the UI!
   */
  calculateNetWorth: (accounts: Account[]): number =>
    accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
};
