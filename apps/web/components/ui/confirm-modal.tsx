"use client";

import React, { useEffect } from "react";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: "default" | "destructive" | "outline";
  isConfirming?: boolean;
  confirmingLabel?: string;
  ariaLabel?: string;
};

// Presentation-only confirm dialog shared by destructive admin actions.
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmVariant = "destructive",
  isConfirming = false,
  confirmingLabel,
  ariaLabel,
}: ConfirmModalProps) {
  const confirmButtonClassName =
    confirmVariant === "destructive"
      ? "bg-destructive text-white hover:bg-destructive/90"
      : confirmVariant === "outline"
        ? "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
        : "bg-primary text-primary-foreground hover:bg-primary/90";

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        className="bg-background w-full max-w-md rounded-lg border p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border bg-background px-4 py-2 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm shadow-xs transition-colors disabled:pointer-events-none disabled:opacity-50 ${confirmButtonClassName}`}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming && confirmingLabel ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
