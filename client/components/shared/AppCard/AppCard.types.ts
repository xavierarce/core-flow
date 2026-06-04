import type { ReactNode } from "react";

/**
 * @function AppCardProps
 * Props for the AppCard component.
 */
export interface AppCardProps {
  title: string;
  subtitle?: string;
  extraHeader?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}
