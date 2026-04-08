import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AdminFormModalShell({
  open,
  onClose,
  title,
  ariaLabel,
  contentClassName,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  contentClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? null : onClose())}
    >
      <DialogContent className={contentClassName} aria-label={ariaLabel}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {children}
          {footer ? (
            <div className="flex justify-end gap-2">{footer}</div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
