import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AppDialogProps {
  trigger: ReactNode; // The button that opens it
  title: string; // The header text
  children: ReactNode; // The form or content inside
  open?: boolean; // Control state (is it open?)
  onOpenChange?: (open: boolean) => void; // Function to change state
}

export const AppDialog = ({
  trigger,
  title,
  children,
  open,
  onOpenChange,
}: AppDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* Render the content (Form) */}
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
