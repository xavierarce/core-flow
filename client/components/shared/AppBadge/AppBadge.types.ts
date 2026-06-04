import type { ReactNode } from "react";

/**
 * @function AppBadgeProps
 * Props for the AppBadge component.
 */
export interface AppBadgeProps {
  children: ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}
