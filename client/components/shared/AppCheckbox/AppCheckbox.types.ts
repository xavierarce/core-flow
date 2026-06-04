/**
 * @function AppCheckboxProps
 * Props for the AppCheckbox component.
 */
export interface AppCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
