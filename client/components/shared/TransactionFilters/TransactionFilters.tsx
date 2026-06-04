"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTransactionFilters } from "./useTransactionFilters";
import type { TransactionFiltersProps } from "./TransactionFilters.types";

/**
 * @component TransactionFilters
 * Search input and month picker that update the URL search params.
 * @param defaultDate - The default selected date value for the month select.
 */
export const TransactionFilters = ({ defaultDate }: TransactionFiltersProps) => {
  const { searchParams, handleSearch, handleMonthChange, months } =
    useTransactionFilters();

  return (
    <div className="flex gap-4 items-center w-full md:w-auto">
      <div className="relative flex-1 md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 bg-muted border-border"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("query")?.toString()}
        />
      </div>

      <Select defaultValue={defaultDate} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[180px] bg-muted border-border">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All History</SelectItem>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
