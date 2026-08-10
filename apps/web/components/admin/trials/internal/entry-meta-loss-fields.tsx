import React from "react";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { TextField, type EntryMetaFieldGroupProps } from "./entry-meta-field";

export function EntryMetaLossFields({
  entryDraft,
  isPending,
  updateField,
  visibleFields,
  showHeading = true,
}: EntryMetaFieldGroupProps) {
  const visible = (field: keyof EntryDraft) =>
    !visibleFields || visibleFields.has(field);

  return (
    <section className="space-y-2">
      {showHeading ? (
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Tappiopisteet
        </h4>
      ) : null}
      <div className="grid gap-3 md:grid-cols-4">
        {visible("hlo") ? (
          <TextField
            label="Hakulöysyys"
            value={entryDraft.hlo}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("hlo", value)}
          />
        ) : null}
        {visible("alo") ? (
          <TextField
            label="Ajolöysyys"
            value={entryDraft.alo}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("alo", value)}
          />
        ) : null}
        {visible("tappiopisteetYhteensa") ? (
          <TextField
            label="Tappiopisteet yhteensä"
            value={entryDraft.tappiopisteetYhteensa}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("tappiopisteetYhteensa", value)}
          />
        ) : null}
      </div>
    </section>
  );
}
