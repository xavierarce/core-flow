import type { Transaction, Category } from "@/types";

/**
 * @function TransactionListProps
 * Props for the TransactionList component.
 */
export interface TransactionListProps {
  transactions: Array<Transaction>;
  categories: Array<Category>;
}
