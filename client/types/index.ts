export interface Category {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
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
  type: "CASH" | "SAVINGS" | "INVESTMENT" | "TRADING" | "CRYPTO" | "REAL_ESTATE";
  transactions: Transaction[];
}

export interface Rule {
  id: string;
  keyword: string;
  categoryId: string;
  userId: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
}
