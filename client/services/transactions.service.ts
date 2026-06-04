import { Transaction } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateTransactionParams {
  amount: number;
  description: string;
  accountId: string;
  isRecurring: boolean;
  categoryId?: string;
  date: string;
}

export const TransactionsService = {
  async create(token: string, data: CreateTransactionParams) {
    if (!API_URL) throw new Error("API URL missing");

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

  async update(token: string, id: string, data: Partial<Transaction>) {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update transaction");
    return res.json();
  },

  async delete(token: string, id: string) {
    if (!API_URL) throw new Error("API URL missing");

    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete transaction");
    return true;
  },
};
