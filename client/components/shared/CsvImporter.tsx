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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setError("");

    Papa.parse(file, {
      header: true, // Expects headers like "Date, Description, Amount"
      skipEmptyLines: true,
      complete: (results) => {
        // Simple validation: check if rows exist
        if (results.data.length > 0) {
          setParsedData(results.data);
        } else {
          setError("File appears empty or invalid.");
        }
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!selectedAccountId || parsedData.length === 0) return;
    setLoading(true);

    try {
      // 1. Map CSV columns to our Schema
      // NOTE: This assumes your CSV has columns "Date", "Description", "Amount"
      // You might need to adjust these keys based on your bank's file!
      const formattedTransactions = parsedData
        .map((row: any) => ({
          date: new Date(row.Date || row.date).toISOString(),
          description:
            row.Description || row.description || row.Label || "Imported Tx",
          amount: parseFloat(row.Amount || row.amount || "0"),
        }))
        .filter((tx) => !isNaN(tx.amount)); // Remove invalid rows

      // 2. Send to Backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}/transactions/${selectedAccountId}/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedTransactions),
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
          {/* Account Selector */}
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

          {/* Dropzone */}
          {!parsedData.length ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
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
                <p className="text-xs text-slate-400">
                  Columns required: Date, Description, Amount
                </p>
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
            className="w-full bg-slate-900 text-white"
          >
            {loading ? "Importing..." : "Confirm Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
