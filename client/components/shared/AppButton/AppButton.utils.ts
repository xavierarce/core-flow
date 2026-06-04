/**
 * @function VARIANT_STYLES
 * Maps variantType names to their corresponding Tailwind class strings.
 */
export const VARIANT_STYLES = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
  secondary: "bg-foreground text-background hover:bg-foreground/90 shadow-sm",
  danger: "bg-destructive hover:bg-destructive/90 text-white shadow-sm",
  outline: "border border-border hover:bg-accent text-foreground bg-transparent",
} as const;
