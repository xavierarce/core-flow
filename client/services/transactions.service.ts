const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateTransactionParams {
  amount: number;
  description: string;
  accountId: string;
  isRecurring: boolean;
  date: string; // ISO date string
}

export const TransactionsService = {
  async create(data: CreateTransactionParams) {
    if (!API_URL) throw new Error("API URL missing");

    const res = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to create transaction");
    }

    return res.json();
  },
};
