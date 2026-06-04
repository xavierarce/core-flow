import { Input } from "@/components/ui/input";
import { AppLabel } from "../AppLabel/AppLabel";
import type { AppInputProps } from "./AppInput.types";

/**
 * @component AppInput
 * Labeled input field with consistent styling.
 * @param label - Display text for the label.
 * @param id - HTML id; auto-generated from label if omitted.
 * @param className - Additional class names for the wrapper.
 */
export const AppInput = ({ label, id, className, ...props }: AppInputProps) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`grid gap-2 ${className}`}>
      <AppLabel htmlFor={inputId} className="text-muted-foreground font-semibold">
        {label}
      </AppLabel>
      <Input
        id={inputId}
        className="focus-visible:ring-emerald-500"
        {...props}
      />
    </div>
  );
};
