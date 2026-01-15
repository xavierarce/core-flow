import { Account } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AccountsService = {
  // 👇 UPDATE: Add token argument
  async getAll(token: string | null, start?: string, end?: string) {
    if (!token) return []; // Safety check

    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const res = await fetch(`${API_URL}/accounts?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`, // 👈 Add the Key
      },
    });

    if (!res.ok) throw new Error("Failed to fetch accounts");
    return res.json();
  },

  /**
   * Create a new account
   * 🔒 NOW REQUIRES TOKEN
   */
  async create(token: string, data: any) {
    const res = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create transaction");
    return res.json();
  },

  /**
   * Update an existing account
   * 🔒 NOW REQUIRES TOKEN
   */
  async update(token: string, id: string, data: any) {
    const res = await fetch(`${API_URL}/accounts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 👈 The Key
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update account");
    return res.json();
  },

  /**
   * Calculate total net worth helper
   * (No token needed for pure math)
   */
  calculateNetWorth: (accounts: Account[]): number =>
    accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),

  /**
   * Delete an account
   * 🔒 NOW REQUIRES TOKEN
   */
  async delete(token: string, id: string) {
    const res = await fetch(`${API_URL}/accounts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // 👈 The Key
      },
    });

    if (!res.ok) throw new Error("Failed to delete account");
    return res.json();
  },
};
