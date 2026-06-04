import type { ReactNode } from "react";

/**
 * @function AppDialogProps
 * Props for the AppDialog component.
 */
export interface AppDialogProps {
  /** The button that opens the dialog */
  trigger: ReactNode;
  /** The header text */
  title: string;
  /** The form or content inside */
  children: ReactNode;
  /** Control state (is it open?) */
  open?: boolean;
  /** Function to change state */
  onOpenChange?: (open: boolean) => void;
}
