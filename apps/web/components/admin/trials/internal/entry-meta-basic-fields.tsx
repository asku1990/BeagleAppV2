import React from "react";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { TextField, type EntryMetaFieldGroupProps } from "./entry-meta-field";

export function EntryMetaBasicFields({
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
          Kokeen ja koiran tiedot
        </h4>
      ) : null}
      <div className="grid gap-3 md:grid-cols-4">
        {visible("koemaasto") ? (
          <TextField
            label="Koemaasto"
            value={entryDraft.koemaasto}
            disabled={isPending}
            onChange={(value) => updateField("koemaasto", value)}
          />
        ) : null}
        {visible("koemuoto") ? (
          <TextField
            label="Koemuoto"
            value={entryDraft.koemuoto}
            disabled={isPending}
            onChange={(value) => updateField("koemuoto", value)}
          />
        ) : null}
        {visible("koetyyppi") ? (
          <label className="space-y-1 text-sm">
            <span>Koetyyppi</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={entryDraft.koetyyppi}
              disabled={isPending}
              onChange={(event) =>
                updateField(
                  "koetyyppi",
                  event.target.value as EntryDraft["koetyyppi"],
                )
              }
            >
              <option value="NORMAL">Normaali</option>
              <option value="KOKOKAUDENKOE">Koko kauden koe</option>
              <option value="PITKAKOE">Pitkä koe</option>
            </select>
          </label>
        ) : null}
        {visible("ke") ? (
          <label className="space-y-1 text-sm">
            <span>Keli</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={entryDraft.ke}
              disabled={isPending}
              onChange={(event) => updateField("ke", event.target.value)}
            >
              <option value="">-</option>
              <option value="P">Paljas maa</option>
              <option value="L">Lumikeli</option>
            </select>
          </label>
        ) : null}
        {visible("lk") ? (
          <TextField
            label="Luokka"
            value={entryDraft.lk}
            disabled={isPending}
            onChange={(value) => updateField("lk", value)}
          />
        ) : null}
        {visible("omistajaSnapshot") ? (
          <TextField
            label="Omistaja"
            value={entryDraft.omistajaSnapshot}
            disabled={isPending}
            className="md:col-span-2"
            onChange={(value) => updateField("omistajaSnapshot", value)}
          />
        ) : null}
        {visible("omistajanKotikuntaSnapshot") ? (
          <TextField
            label="Omistajan kotikunta"
            value={entryDraft.omistajanKotikuntaSnapshot}
            disabled={isPending}
            onChange={(value) =>
              updateField("omistajanKotikuntaSnapshot", value)
            }
          />
        ) : null}
      </div>
    </section>
  );
}
