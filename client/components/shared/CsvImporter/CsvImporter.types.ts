import type { Account } from "@/types";

/**
 * @function CsvImporterProps
 * Props for the CsvImporter component.
 */
export interface CsvImporterProps {
  accounts: Array<Account>;
}

/**
 * @function ParsedTransaction
 * A single transaction parsed from a CSV row.
 */
export interface ParsedTransaction {
  date: string;
  description: string;
  rawText: string | null;
  amount: number;
}

/**
 * @function CsvRow
 * A raw row from a parsed CSV file.
 */
export type CsvRow = Record<string, string>;
