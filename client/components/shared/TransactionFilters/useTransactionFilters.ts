"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

/**
 * @hook useTransactionFilters
 * Manages search query and month filter state via URL search params.
 * @returns Search params, month options, and handlers for search and month change.
 */
export const useTransactionFilters = () => {
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
    params.delete("limit");
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", value);
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

  return { searchParams, handleSearch, handleMonthChange, months };
};
