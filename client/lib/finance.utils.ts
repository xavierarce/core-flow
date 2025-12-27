import { Account, Transaction } from "@/types";

interface MonthlyData {
  name: string; // e.g., "Jan", "Feb"
  income: number;
  expense: number;
}

export const calculateMonthlyCashFlow = (
  accounts: Account[]
): MonthlyData[] => {
  const monthlyMap = new Map<string, { income: number; expense: number }>();

  // 1. Loop through ALL accounts and ALL transactions
  accounts.forEach((acc) => {
    acc.transactions.forEach((tx) => {
      const date = new Date(tx.date);
      // Create a key like "Jan 2024" or just "Jan" if simpler
      const monthKey = date.toLocaleString("en-US", { month: "short" });

      const current = monthlyMap.get(monthKey) || { income: 0, expense: 0 };
      const amount = parseFloat(tx.amount);

      // 2. Separate Income vs Expense
      if (amount > 0) {
        current.income += amount;
      } else {
        current.expense += Math.abs(amount); // Store as positive for the chart
      }

      monthlyMap.set(monthKey, current);
    });
  });

  // 3. Convert Map to Array and Sort by Month (Simplified for now)
  // In a real app, you'd sort by year+month index
  return Array.from(monthlyMap.entries()).map(([name, data]) => ({
    name,
    ...data,
  }));
};
