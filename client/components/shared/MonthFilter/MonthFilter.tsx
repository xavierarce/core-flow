"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { AppButton } from "../AppButton/AppButton";
import { useMonthFilter } from "./useMonthFilter";

/**
 * @component MonthFilter
 * Navigation control to browse months, synced with URL search params.
 */
export const MonthFilter = () => {
  const { currentDate, changeMonth } = useMonthFilter();

  return (
    <div className="flex items-center gap-3 bg-card px-3 py-1.5 rounded-md border shadow-sm">
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
