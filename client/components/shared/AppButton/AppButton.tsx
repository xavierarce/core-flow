import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppButtonProps } from "./AppButton.types";
import { VARIANT_STYLES } from "./AppButton.utils";

/**
 * @component AppButton
 * Extends the base Button with semantic variantType shortcuts.
 * @param variantType - Shorthand variant: "primary", "secondary", "danger", or "outline".
 * @param variant - Base shadcn variant; ignored when variantType is set.
 * @param className - Additional class names.
 */
export const AppButton = ({
  className,
  variantType,
  variant,
  ...props
}: AppButtonProps) => (
  <Button
    variant={variantType ? "default" : variant}
    className={cn(variantType ? VARIANT_STYLES[variantType] : "", className)}
    {...props}
  />
);
