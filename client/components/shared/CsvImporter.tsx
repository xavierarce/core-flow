"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Account } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface CsvImporterProps {
  accounts: Array<Account>;
}

interface ParsedTransaction {
  date: string;
  description: string;
  rawText: string | null;
  amount: number;
}

type CsvRow = Record<string, string>;

// Helper: Find a value in a row by fuzzy matching column names.
// Makes it robust against encoding variants like "Détail" vs "Detail".
const getValue = (row: CsvRow, searchTerms: Array<string>): string | null => {
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

const parseRows = (rows: Array<CsvRow>): Array<ParsedTransaction> => {
  return rows
    .map((row) => {
      const dateRaw = getValue(row, ["Date"]);
      const labelRaw = getValue(row, ["tail", "Detail", "Libell", "Desc", "Label"]);
      const amountRaw = getValue(row, ["Montant", "Amount", "Debit", "Credit"]);

      if (!dateRaw || !amountRaw) return null;

      const [day, month, year] = dateRaw.split("/");
      const isoDate = `${year}-${month}-${day}`;

      if (new Date(isoDate).toString() === "Invalid Date") return null;

      // French number format: "-2,50" → JS -2.50
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
};

export const CsvImporter = ({ accounts }: CsvImporterProps) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id ?? ""
  );
  const [parsedData, setParsedData] = useState<Array<ParsedTransaction>>([]);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: Array<File>) => {
      const file = acceptedFiles[0];
      setError("");

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;

        if (!text) {
          setError("File is empty");
          return;
        }

        // SG Export: find the real header line (some exports have metadata rows before it)
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
    },
    []
  );

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload size={16} /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Import Bank History</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Account</label>
            <Select
              onValueChange={setSelectedAccountId}
              value={selectedAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Target Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!parsedData.length ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:bg-muted/40"}
                ${error ? "border-destructive bg-destructive/10" : ""}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText size={32} />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <p>Drag & drop your CSV here, or click to select</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                  <Check size={16} />
                </div>
                <div>
                  <p className="font-medium text-emerald-400">Ready to import</p>
                  <p className="text-xs text-emerald-400/70">
                    {parsedData.length} transactions found
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParsedData([])}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Clear
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={loading || parsedData.length === 0}
            className="w-full"
          >
            {loading ? "Importing..." : "Confirm Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
