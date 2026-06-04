import type { ComponentProps } from "react";
import type { Button } from "@/components/ui/button";

/**
 * @function AppButtonProps
 * Props for the AppButton component.
 */
export interface AppButtonProps extends ComponentProps<typeof Button> {
  variantType?: "primary" | "secondary" | "danger" | "outline";
}
