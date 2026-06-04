import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLabel } from "../AppLabel/AppLabel";
import { cn } from "@/lib/utils";
import type { AppSelectProps } from "./AppSelect.types";

/**
 * @component AppSelect
 * Accessible select dropdown with optional label and badge variant.
 * @param label - Optional label above the select.
 * @param placeholder - Placeholder text when no value is selected.
 * @param value - Controlled selected value.
 * @param onChange - Callback when the value changes.
 * @param options - Array of selectable options.
 * @param disabled - Whether the select is disabled.
 * @param className - Additional class names for the wrapper.
 * @param triggerClassName - Additional class names for the trigger element.
 * @param triggerStyle - Inline styles for the trigger element.
 * @param variant - "default" for standard, "badge" for compact inline style.
 */
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
        <AppLabel className="text-muted-foreground font-semibold">{label}</AppLabel>
      )}

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          style={triggerStyle}
          className={cn(
            "focus:ring-emerald-500",
            isBadge &&
              "h-auto min-h-0 border-none shadow-none focus:ring-0 [&>svg]:hidden",
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
