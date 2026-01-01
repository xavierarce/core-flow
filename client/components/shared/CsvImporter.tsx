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
import { Account } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface CsvImporterProps {
  accounts: Account[];
}

export const CsvImporter = ({ accounts }: CsvImporterProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id || ""
  );
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Helper: Find a value in a row by fuzzy matching column names
  // This makes it robust against "Détail" vs "Detail" vs "DÃ©tail" (encoding errors)
  const getValue = (row: any, searchTerms: string[]) => {
    const keys = Object.keys(row);
    for (const term of searchTerms) {
      // Find a key that contains the search term (case insensitive)
      const foundKey = keys.find((key) =>
        key.toLowerCase().includes(term.toLowerCase())
      );
      if (foundKey && row[foundKey]) {
        return row[foundKey];
      }
    }
    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setError("");

    // 1. Read as UTF-8 (Standard for modern exports)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      if (!text) {
        setError("File is empty");
        return;
      }

      // SG Export Hack: Find the real header line
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

      Papa.parse(cleanCsv, {
        header: true,
        delimiter: ";", // SG uses semi-colons
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            parseRows(results.data);
          } else {
            setError("File appears empty after cleaning.");
          }
        },
        error: (err: any) => {
          setError("Failed to parse CSV: " + err.message);
        },
      });
    };

    reader.readAsText(file, "UTF-8");
  }, []);

  const parseRows = (rows: any[]) => {
    try {
      const formatted = rows
        .map((row: any) => {
          // 2. Fuzzy Match Columns
          // We look for 'tail' to match 'Détail', 'belle' for 'Libellé'
          const dateRaw = getValue(row, ["Date"]);
          const labelRaw = getValue(row, [
            "tail",
            "Detail",
            "Libell",
            "Desc",
            "Label",
          ]);
          const noteRaw = getValue(row, ["Libell", "Label"]); // Fallback for extra info
          const amountRaw = getValue(row, [
            "Montant",
            "Amount",
            "Debit",
            "Credit",
          ]);

          if (!dateRaw || !amountRaw) return null;

          // 3. Fix Date (DD/MM/YYYY -> YYYY-MM-DD)
          const [day, month, year] = dateRaw.split("/");
          const isoDate = `${year}-${month}-${day}`;

          if (new Date(isoDate).toString() === "Invalid Date") return null;

          // 4. Fix Amount (French "-2,50" -> JS -2.50)
          const cleanAmount = amountRaw.replace(",", ".").replace(/\s/g, "");
          const amount = parseFloat(cleanAmount);

          if (isNaN(amount)) return null;

          return {
            date: new Date(isoDate).toISOString(),
            description: labelRaw || "Imported Transaction",
            rawText: labelRaw, //
            amount: amount,
          };
        })
        .filter((tx) => tx !== null);

      setParsedData(formatted);
    } catch (e) {
      console.error(e);
      setError("Error mapping data. Check console.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!selectedAccountId || parsedData.length === 0) return;
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}/transactions/${selectedAccountId}/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedData),
        }
      );

      if (!res.ok) throw new Error("Import failed");

      setOpen(false);
      setParsedData([]);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Server error during import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload size={16} /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
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
              <SelectContent className="bg-white">
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
                ${
                  isDragActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-300 hover:bg-slate-50"
                }
                ${error ? "border-red-300 bg-red-50" : ""}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <FileText size={32} />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <p>Drag & drop your CSV here, or click to select</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                  <Check size={16} />
                </div>
                <div>
                  <p className="font-medium text-emerald-900">
                    Ready to import
                  </p>
                  <p className="text-xs text-emerald-700">
                    {parsedData.length} transactions found
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParsedData([])}
                className="text-emerald-700 hover:text-emerald-900"
              >
                Clear
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={loading || parsedData.length === 0}
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
          >
            {loading ? "Importing..." : "Confirm Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
