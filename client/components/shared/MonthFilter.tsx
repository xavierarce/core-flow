"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { AppButton } from "./AppButton";

export const MonthFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Get current date from URL or default to Today
  const dateParam = searchParams.get("date");
  const currentDate = dateParam ? new Date(dateParam) : new Date();

  // 2. Handle Navigation
  const changeMonth = (offset: number) => {
    const newDate =
      offset > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1);

    // Convert to simple format YYYY-MM
    // We only need the first day of the month for the URL
    const isoDate = startOfMonth(newDate).toISOString();

    // Update URL
    router.push(`/?date=${isoDate}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-md border shadow-sm">
      <AppButton
        variant="ghost"
        size="icon-sm"
        onClick={() => changeMonth(-1)}
        className="h-6 w-6 hover:text-emerald-600"
      >
        <ChevronLeft size={16} />
      </AppButton>

      <span className="font-semibold text-sm w-32 text-center select-none">
        {format(currentDate, "MMMM yyyy")}
      </span>

      <AppButton
        variant="ghost"
        size="icon-sm"
        onClick={() => changeMonth(1)}
        className="h-6 w-6 hover:text-emerald-600"
      >
        <ChevronRight size={16} />
      </AppButton>
    </div>
  );
};
