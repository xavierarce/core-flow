export interface Transaction {
  id: string;
  amount: string; // Decimal comes as string from JSON APIs usually
  description: string;
  category: string | null; // Can be null in your DB
  date: string;
  isRecurring: boolean;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  currency: string;
  balance: string;
  type: "CASH" | "SAVINGS" | "INVESTMENT" | "TRADING";
  transactions: Transaction[];
}
