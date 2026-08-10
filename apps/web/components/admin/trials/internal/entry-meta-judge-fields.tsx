import React from "react";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { TextField, type EntryMetaFieldGroupProps } from "./entry-meta-field";

export function EntryMetaJudgeFields({
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
          Tuomarit ja allekirjoitukset
        </h4>
      ) : null}
      <div className="grid gap-3 md:grid-cols-4">
        {visible("ryhmatuomariNimi") ? (
          <TextField
            label="Ryhmätuomari"
            value={entryDraft.ryhmatuomariNimi}
            disabled={isPending}
            onChange={(value) => updateField("ryhmatuomariNimi", value)}
          />
        ) : null}
        {visible("palkintotuomariNimi") ? (
          <TextField
            label="Palkintotuomari"
            value={entryDraft.palkintotuomariNimi}
            disabled={isPending}
            onChange={(value) => updateField("palkintotuomariNimi", value)}
          />
        ) : null}
        {visible("judge") ? (
          <TextField
            label="Ylituomari"
            value={entryDraft.judge}
            disabled={isPending}
            onChange={(value) => updateField("judge", value)}
          />
        ) : null}
        {visible("ylituomariNumeroSnapshot") ? (
          <TextField
            label="Ylituomarin numero"
            value={entryDraft.ylituomariNumeroSnapshot}
            disabled={isPending}
            onChange={(value) => updateField("ylituomariNumeroSnapshot", value)}
          />
        ) : null}
      </div>
    </section>
  );
}
