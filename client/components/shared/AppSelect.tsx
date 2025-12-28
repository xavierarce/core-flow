import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLabel } from "./AppLabel";
import { cn } from "@/lib/utils";

export interface SelectOption {
  id: string;
  label: string;
  color?: string;
}

interface AppSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
  variant?: "default" | "badge";
}

export const AppSelect = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  className,
  triggerClassName,
  triggerStyle,
  variant = "default",
}: AppSelectProps) => {
  const isBadge = variant === "badge";

  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <AppLabel className="text-slate-600 font-semibold">{label}</AppLabel>
      )}

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          style={triggerStyle}
          className={cn(
            "focus:ring-emerald-500",
            isBadge &&
              "h-auto min-h-0 border-none shadow-none focus:ring-0 [&>svg]:hidden ",
            triggerClassName
          )}
        >
          <span className={cn(isBadge ? "flex items-center" : "")}>
            <SelectValue placeholder={placeholder} />
          </span>
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={opt.id}
              value={opt.id}
              className={cn(isBadge ? "text-xs" : "")}
            >
              <div className="flex items-center gap-2">
                {opt.color && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                )}
                {opt.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
