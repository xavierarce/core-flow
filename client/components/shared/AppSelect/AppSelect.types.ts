import type { CSSProperties } from "react";

/**
 * @function SelectOption
 * A single option in the AppSelect dropdown.
 */
export interface SelectOption {
  id: string;
  label: string;
  color?: string;
}

/**
 * @function AppSelectProps
 * Props for the AppSelect component.
 */
export interface AppSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<SelectOption>;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  variant?: "default" | "badge";
}
