import { Checkbox } from "@/components/ui/checkbox";
import { AppLabel } from "../AppLabel/AppLabel";
import type { AppCheckboxProps } from "./AppCheckbox.types";

/**
 * @component AppCheckbox
 * Styled checkbox with an associated label.
 * @param id - HTML id linking the checkbox to its label.
 * @param label - Display text for the label.
 * @param checked - Controlled checked state.
 * @param onCheckedChange - Callback invoked when the checked state changes.
 */
export const AppCheckbox = ({
  id,
  label,
  checked,
  onCheckedChange,
}: AppCheckboxProps) => (
  <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-md border border-border">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(val) => onCheckedChange(val as boolean)}
    />
    <AppLabel
      htmlFor={id}
      className="text-sm font-medium cursor-pointer text-foreground"
    >
      {label}
    </AppLabel>
  </div>
);
