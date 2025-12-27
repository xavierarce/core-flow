import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react"; // <--- 1. Import this

// 2. Extend the types of the Button component directly
interface AppButtonProps extends ComponentProps<typeof Button> {
  variantType?: "primary" | "secondary" | "danger" | "outline";
}

export const AppButton = ({
  className,
  variantType = "primary",
  ...props
}: AppButtonProps) => {
  const styles = {
    // Note: We use !bg-opacity-100 or specific shades to override Shadcn's defaults if needed
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    secondary: "bg-slate-900 hover:bg-slate-800 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    outline: "border-slate-200 hover:bg-slate-50 text-slate-900 bg-transparent",
  };

  // 3. Pass everything else (...props) to the Shadcn Button
  return <Button className={cn(styles[variantType], className)} {...props} />;
};
