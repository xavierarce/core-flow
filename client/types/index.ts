export interface Category {
  id: string;
  name: string;
  type: string; // "EXPENSE" | "INCOME"
  color: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  isRecurring?: boolean;
  source?: "MANUAL" | "BANK";

  category?: Category;
  categoryId?: string;
}

export interface Account {
  id: string;
  name: string;
  isAutomated?: boolean;
  institution: string;
  currency: string;
  balance: number | string;
  type: "CASH" | "SAVINGS" | "INVESTMENT" | "TRADING";
  transactions: Transaction[];
}
