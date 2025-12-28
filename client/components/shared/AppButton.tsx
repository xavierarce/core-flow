import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface AppButtonProps extends ComponentProps<typeof Button> {
  // Make this optional so we can skip it and use standard Shadcn variants
  variantType?: "primary" | "secondary" | "danger" | "outline";
}

export const AppButton = ({
  className,
  variantType,
  variant, // Destructure variant so we can check it
  ...props
}: AppButtonProps) => {
  // Banking specific overrides
  const customStyles = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
    secondary: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    outline: "border-slate-200 hover:bg-slate-50 text-slate-900 bg-transparent",
  };

  // If variantType is passed, use the custom style.
  // Otherwise, pass undefined to className so Shadcn handles the styling via the 'variant' prop.
  const customClass = variantType ? customStyles[variantType] : "";

  return (
    <Button
      // If we use a variantType, we force the 'default' variant structure but override colors
      // If no variantType, we pass the 'variant' prop through (e.g. ghost, link)
      variant={variantType ? "default" : variant}
      className={cn(customClass, className)}
      {...props}
    />
  );
};
