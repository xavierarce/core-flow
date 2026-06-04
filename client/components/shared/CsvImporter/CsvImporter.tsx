"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useCsvImporter } from "./useCsvImporter";
import type { CsvImporterProps } from "./CsvImporter.types";

/**
 * @component CsvImporter
 * Dialog that accepts a CSV bank export file, parses it, and imports transactions.
 * @param accounts - Available accounts to import transactions into.
 */
export const CsvImporter = ({ accounts }: CsvImporterProps) => {
  const {
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
  } = useCsvImporter({ accounts });

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
