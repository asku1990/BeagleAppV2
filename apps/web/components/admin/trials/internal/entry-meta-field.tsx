import React from "react";
import { Input } from "@/components/ui/input";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";

export type EntryMetaFieldGroupProps = {
  entryDraft: EntryDraft;
  isPending: boolean;
  updateField: (field: keyof EntryDraft, value: string) => void;
  visibleFields?: ReadonlySet<keyof EntryDraft>;
  showHeading?: boolean;
};

export function TextField({
  label,
  value,
  disabled,
  inputMode,
  className,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`space-y-1 text-sm ${className ?? ""}`}>
      <span>{label}</span>
      <Input
        value={value}
        inputMode={inputMode}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
