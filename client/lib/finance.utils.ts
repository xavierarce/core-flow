import { Account } from "@/types";

interface MonthlyData {
  name: string; // e.g., "Dec 23"
  income: number;
  expense: number;
  dateKey: number; // Hidden helper for sorting
}

export const calculateMonthlyCashFlow = (
  accounts: Account[]
): MonthlyData[] => {
  // Map key will be "Dec 23", value holds the sums AND a sorting helper
  const monthlyMap = new Map<
    string,
    { income: number; expense: number; dateKey: number }
  >();

  // 1. Loop through ALL accounts and ALL transactions
  accounts.forEach((acc) => {
    acc.transactions.forEach((tx) => {
      const date = new Date(tx.date);

      // FIX 1: Include the Year in the label (e.g., "Dec 23")
      const label = date.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });

      // FIX 2: Create a sortable key (e.g., 202311 for Nov 2023)
      // Year * 100 + Month ensures purely chronological sorting
      const sortKey = date.getFullYear() * 100 + date.getMonth();

      const current = monthlyMap.get(label) || {
        income: 0,
        expense: 0,
        dateKey: sortKey,
      };
      const amount = parseFloat(tx.amount);

      // Separate Income vs Expense
      if (amount > 0) {
        current.income += amount;
      } else {
        current.expense += Math.abs(amount);
      }

      monthlyMap.set(label, current);
    });
  });

  // 3. Convert to Array AND SORT Chronologically
  return Array.from(monthlyMap.entries())
    .map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense,
      dateKey: data.dateKey, // Keep it for the sort
    }))
    .sort((a, b) => a.dateKey - b.dateKey); // Smallest date (oldest) first
};
