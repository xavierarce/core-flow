import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AppLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean; // Optional: Add a visual indicator for required fields later
}

export const AppLabel = ({ className, children, ...props }: AppLabelProps) => {
  return (
    <Label
      className={cn(
        "text-sm font-semibold text-slate-700 mb-1.5 block", // Standardized Style
        className
      )}
      {...props}
    >
      {children}
    </Label>
  );
};
