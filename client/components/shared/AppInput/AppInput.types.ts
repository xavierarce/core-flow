import type { InputHTMLAttributes } from "react";

/**
 * @function AppInputProps
 * Props for the AppInput component.
 */
export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
