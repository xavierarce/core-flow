import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface AppButtonProps extends ComponentProps<typeof Button> {
  variantType?: "primary" | "secondary" | "danger" | "outline";
}

const VARIANT_STYLES = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
  secondary: "bg-foreground text-background hover:bg-foreground/90 shadow-sm",
  danger: "bg-destructive hover:bg-destructive/90 text-white shadow-sm",
  outline:
    "border border-border hover:bg-accent text-foreground bg-transparent",
} as const;

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
