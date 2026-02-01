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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // npm install use-debounce

export const TransactionFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 1. Handle Text Search (Debounced to wait for typing to stop)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // 2. Handle Month Selection
  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("date"); // Remove date filter
    } else {
      params.set("date", value);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  // Generate last 12 months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      value: d.toISOString().slice(0, 7), // "2026-02"
    };
  });

  return (
    <div className="flex gap-4 items-center w-full md:w-auto">
      {/* Search Bar */}
      <div className="relative flex-1 md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search transactions..."
          className="pl-9 bg-slate-50 border-slate-200"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("query")?.toString()}
        />
      </div>

      {/* Date Filter */}
      <Select
        defaultValue={searchParams.get("date")?.toString() || "all"}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
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
