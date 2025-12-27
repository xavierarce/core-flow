import { Input } from "@/components/ui/input";
import { AppLabel } from "./AppLabel";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AppInput = ({ label, id, className, ...props }: AppInputProps) => {
  // Generate a random ID if none provided to link Label and Input accessibility
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`grid gap-2 ${className}`}>
      <AppLabel htmlFor={inputId} className="text-slate-600 font-semibold">
        {label}
      </AppLabel>
      <Input
        id={inputId}
        className="focus-visible:ring-emerald-500" // Custom Focus Color
        {...props}
      />
    </div>
  );
};
