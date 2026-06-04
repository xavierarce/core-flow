import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AppDialogProps } from "./AppDialog.types";

/**
 * @component AppDialog
 * Accessible dialog wrapper with a trigger, title, and body content slot.
 * @param trigger - The element that opens the dialog.
 * @param title - Dialog header title text.
 * @param children - Dialog body content.
 * @param open - Controlled open state.
 * @param onOpenChange - Callback invoked when the open state changes.
 */
export const AppDialog = ({
  trigger,
  title,
  children,
  open,
  onOpenChange,
}: AppDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="sm:max-w-[425px] bg-card">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="py-4">{children}</div>
    </DialogContent>
  </Dialog>
);
