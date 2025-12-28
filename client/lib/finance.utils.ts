import { Account } from "@/types";

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
  dateKey: number;
}

export const calculateMonthlyCashFlow = (
  accounts: Account[]
): MonthlyData[] => {
  const monthlyMap = new Map<
    string,
    { income: number; expense: number; dateKey: number }
  >();

  accounts.forEach((acc) => {
    acc.transactions.forEach((tx) => {
      const date = new Date(tx.date);

      const label = date.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const sortKey = date.getFullYear() * 100 + date.getMonth();

      const current = monthlyMap.get(label) || {
        income: 0,
        expense: 0,
        dateKey: sortKey,
      };

      const amount = Number(tx.amount);

      if (amount > 0) {
        current.income += amount;
      } else {
        current.expense += Math.abs(amount);
      }

      monthlyMap.set(label, current);
    });
  });

  return Array.from(monthlyMap.entries())
    .map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense,
      dateKey: data.dateKey,
    }))
    .sort((a, b) => a.dateKey - b.dateKey);
};

// ... keep calculateExpenseBreakdown as is, it was already correct
export const calculateExpenseBreakdown = (accounts: Account[]) => {
  const breakdown: Record<
    string,
    { name: string; value: number; color: string }
  > = {};

  accounts.forEach((acc) => {
    acc.transactions.forEach((tx) => {
      const amount = Number(tx.amount); // This one was already correct

      if (amount < 0 && tx.category) {
        const catName = tx.category.name;

        if (!breakdown[catName]) {
          breakdown[catName] = {
            name: catName,
            value: 0,
            color: tx.category.color,
          };
        }

        breakdown[catName].value += Math.abs(amount);
      }
    });
  });

  return Object.values(breakdown).sort((a, b) => b.value - a.value);
};
