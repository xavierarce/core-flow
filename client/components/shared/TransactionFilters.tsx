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
import { useDebouncedCallback } from "use-debounce";

// 👇 Accept the prop from the server
export const TransactionFilters = ({
  defaultDate,
}: {
  defaultDate: string;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    // Reset limit when searching
    params.delete("limit");
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    // Explicitly set the date (even if "all")
    params.set("date", value);
    // Reset limit when changing date
    params.delete("limit");
    replace(`${pathname}?${params.toString()}`);
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      value: d.toISOString().slice(0, 7),
    };
  });

  return (
    <div className="flex gap-4 items-center w-full md:w-auto">
      <div className="relative flex-1 md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search..."
          className="pl-9 bg-slate-50 border-slate-200"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("query")?.toString()}
        />
      </div>

      <Select
        // 👇 Use prop as default, or fallback to 'all'
        defaultValue={defaultDate}
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
