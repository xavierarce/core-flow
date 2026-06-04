import type { ComponentProps } from "react";
import type { Label } from "@/components/ui/label";

/**
 * @function AppLabelProps
 * Props for the AppLabel component.
 */
export interface AppLabelProps extends ComponentProps<typeof Label> {
  /** Optional: Add a visual indicator for required fields later */
  required?: boolean;
}
