import type { Transaction, Category } from "@/types";

/**
 * @function TransactionRowProps
 * Props for the TransactionRow component.
 */
export interface TransactionRowProps {
  transaction: Transaction;
  categories: Array<Category>;
}
