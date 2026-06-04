"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addMonths, subMonths, startOfMonth } from "date-fns";

/**
 * @hook useMonthFilter
 * Reads the current month from URL params and provides navigation to adjacent months.
 * @returns The current date and a changeMonth handler.
 */
export const useMonthFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const currentDate = dateParam ? new Date(dateParam) : new Date();

  const changeMonth = (offset: number) => {
    const newDate = offset > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    router.push(`/?date=${startOfMonth(newDate).toISOString()}`);
  };

  return { currentDate, changeMonth };
};
