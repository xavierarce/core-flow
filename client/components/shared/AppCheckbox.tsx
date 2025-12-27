import { Checkbox } from "@/components/ui/checkbox";
import { AppLabel } from "./AppLabel";

interface AppCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const AppCheckbox = ({
  id,
  label,
  checked,
  onCheckedChange,
}: AppCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-md border border-slate-100">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(val as boolean)}
      />
      <AppLabel
        htmlFor={id}
        className="text-sm font-medium cursor-pointer text-slate-700"
      >
        {label}
      </AppLabel>
    </div>
  );
};
