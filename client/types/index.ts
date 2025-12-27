export interface Transaction {
  id: string;
  amount: string; // Decimal comes as string from JSON APIs usually
  description: string;
  category?: string;
  date: string;
  isRecurring?: boolean;
  source?: "MANUAL" | "BANK";
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
