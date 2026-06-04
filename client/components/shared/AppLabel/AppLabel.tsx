import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AppLabelProps } from "./AppLabel.types";

/**
 * @component AppLabel
 * Styled label wrapper with consistent typography.
 * @param className - Additional class names.
 * @param children - Label content.
 * @param required - Optional visual required indicator.
 */
export const AppLabel = ({ className, children, ...props }: AppLabelProps) => (
  <Label
    className={cn("text-sm font-semibold text-foreground mb-1.5 block", className)}
    {...props}
  >
    {children}
  </Label>
);
