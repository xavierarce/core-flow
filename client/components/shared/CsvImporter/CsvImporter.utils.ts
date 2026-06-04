import type { CsvRow, ParsedTransaction } from "./CsvImporter.types";

/**
 * @function getValue
 * Finds a value in a CSV row by fuzzy-matching column names against search terms.
 * Robust against encoding variants like "Détail" vs "Detail".
 * @param row - A single CSV row as a key-value map.
 * @param searchTerms - Terms to search for in column names.
 * @returns The first matching value, or null if none found.
 */
export const getValue = (row: CsvRow, searchTerms: Array<string>): string | null => {
  const keys = Object.keys(row);
  for (const term of searchTerms) {
    const foundKey = keys.find((key) =>
      key.toLowerCase().includes(term.toLowerCase())
    );
    if (foundKey && row[foundKey]) {
      return row[foundKey];
    }
  }
  return null;
};

/**
 * @function parseRows
 * Converts raw CSV rows into structured ParsedTransaction objects.
 * Filters out rows with missing or invalid dates/amounts.
 * @param rows - Raw CSV rows to parse.
 * @returns Array of valid parsed transactions.
 */
export const parseRows = (rows: Array<CsvRow>): Array<ParsedTransaction> =>
  rows
    .map((row) => {
      const dateRaw = getValue(row, ["Date"]);
      const labelRaw = getValue(row, ["tail", "Detail", "Libell", "Desc", "Label"]);
      const amountRaw = getValue(row, ["Montant", "Amount", "Debit", "Credit"]);

      if (!dateRaw || !amountRaw) return null;

      const [day, month, year] = dateRaw.split("/");
      const isoDate = `${year}-${month}-${day}`;

      if (new Date(isoDate).toString() === "Invalid Date") return null;

      const cleanAmount = amountRaw.replace(",", ".").replace(/\s/g, "");
      const amount = parseFloat(cleanAmount);

      if (isNaN(amount)) return null;

      return {
        date: new Date(isoDate).toISOString(),
        description: labelRaw ?? "Imported Transaction",
        rawText: labelRaw,
        amount,
      };
    })
    .filter((tx): tx is ParsedTransaction => tx !== null);
