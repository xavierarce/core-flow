"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { parseRows } from "./CsvImporter.utils";
import type { CsvImporterProps, CsvRow, ParsedTransaction } from "./CsvImporter.types";

/**
 * @hook useCsvImporter
 * Manages file drop, CSV parsing, account selection, and import submission.
 * @param accounts - Available accounts to import transactions into.
 * @returns State values, dropzone props, and action handlers.
 */
export const useCsvImporter = ({ accounts }: CsvImporterProps) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id ?? ""
  );
  const [parsedData, setParsedData] = useState<Array<ParsedTransaction>>([]);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    const file = acceptedFiles[0];
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      if (!text) {
        setError("File is empty");
        return;
      }

      const lines = text.split(/\r\n|\n/);
      const headerIndex = lines.findIndex(
        (line) =>
          line.toLowerCase().startsWith("date") || line.includes("Date de")
      );

      if (headerIndex === -1) {
        setError("Could not find valid headers (Date, Montant, etc.)");
        return;
      }

      const cleanCsv = lines.slice(headerIndex).join("\n");

      Papa.parse<CsvRow>(cleanCsv, {
        header: true,
        delimiter: ";",
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setParsedData(parseRows(results.data));
          } else {
            setError("File appears empty after cleaning.");
          }
        },
        error: (err: Error) => {
          setError("Failed to parse CSV: " + err.message);
        },
      });
    };

    reader.readAsText(file, "UTF-8");
  }, []);

  const handleImport = async () => {
    if (!selectedAccountId || parsedData.length === 0) return;
    setLoading(true);

    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}/transactions/${selectedAccountId}/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(parsedData),
        }
      );

      if (!res.ok) throw new Error("Import failed");

      setOpen(false);
      setParsedData([]);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Server error during import.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  return {
    open,
    setOpen,
    loading,
    selectedAccountId,
    setSelectedAccountId,
    parsedData,
    setParsedData,
    error,
    getRootProps,
    getInputProps,
    isDragActive,
    handleImport,
  };
};
