import { Account } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AccountsService = {
  async getAll(token: string | null, start?: string, end?: string): Promise<Array<Account>> {
    if (!token) return [];

    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const res = await fetch(`${API_URL}/accounts?${params.toString()}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch accounts");
    return res.json();
  },

  async create(token: string, data: object) {
    const res = await fetch(`${API_URL}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create account");
    return res.json();
  },

  async update(token: string, id: string, data: object) {
    const res = await fetch(`${API_URL}/accounts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update account");
    return res.json();
  },

  async delete(token: string, id: string) {
    const res = await fetch(`${API_URL}/accounts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete account");
    return res.json();
  },

  calculateNetWorth: (accounts: Array<Account>): number =>
    accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
};
