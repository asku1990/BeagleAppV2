import React from "react";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { TextField, type EntryMetaFieldGroupProps } from "./entry-meta-field";

type Props = EntryMetaFieldGroupProps & {
  showWeather?: boolean;
};

export function EntryMetaResultFields({
  entryDraft,
  isPending,
  updateField,
  visibleFields,
  showHeading = true,
  showWeather = false,
}: Props) {
  const visible = (field: keyof EntryDraft) =>
    !visibleFields || visibleFields.has(field);

  return (
    <section className="space-y-2">
      {showHeading ? (
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Tulos ja huomautus
        </h4>
      ) : null}
      <div className="grid gap-3 md:grid-cols-4">
        {showWeather && visible("ke") ? (
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
        {visible("award") ? (
          <TextField
            label="Palkinto"
            value={entryDraft.award}
            disabled={isPending}
            onChange={(value) => updateField("award", value)}
          />
        ) : null}
        {visible("rank") ? (
          <TextField
            label="Sijoitus"
            value={entryDraft.rank}
            disabled={isPending}
            onChange={(value) => updateField("rank", value)}
          />
        ) : null}
        {visible("points") ? (
          <TextField
            label="Loppupisteet"
            value={entryDraft.points}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("points", value)}
          />
        ) : null}
        {visible("koiriaLuokassa") ? (
          <TextField
            label="Koiria luokassa"
            value={entryDraft.koiriaLuokassa}
            inputMode="numeric"
            disabled={isPending}
            onChange={(value) => updateField("koiriaLuokassa", value)}
          />
        ) : null}
        {visible("huomautus") ? (
          <label className="space-y-1 text-sm">
            <span>Huomautus</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={entryDraft.huomautus}
              disabled={isPending}
              onChange={(event) =>
                updateField(
                  "huomautus",
                  event.target.value as EntryDraft["huomautus"],
                )
              }
            >
              <option value="">-</option>
              <option value="LUOPUI">Luopui</option>
              <option value="SULJETTU">Suljettu</option>
              <option value="KESKEYTETTY">Keskeytetty</option>
            </select>
          </label>
        ) : null}
        {visible("huomautusTeksti") ? (
          <label className="space-y-1 text-sm md:col-span-3">
            <span>Huomautusteksti</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={entryDraft.huomautusTeksti}
              disabled={isPending}
              onChange={(event) =>
                updateField("huomautusTeksti", event.target.value)
              }
            />
          </label>
        ) : null}
      </div>
    </section>
  );
}
