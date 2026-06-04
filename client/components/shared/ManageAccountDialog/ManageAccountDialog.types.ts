import type { Account } from "@/types";

/**
 * @function ManageAccountDialogProps
 * Props for the ManageAccountDialog component.
 */
export interface ManageAccountDialogProps {
  /** If provided, the dialog operates in edit mode for this account. */
  account?: Account;
}
