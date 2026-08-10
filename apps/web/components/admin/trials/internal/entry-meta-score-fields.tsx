import React from "react";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { TextField, type EntryMetaFieldGroupProps } from "./entry-meta-field";

type Props = EntryMetaFieldGroupProps & {
  showMerit: boolean;
  showOther: boolean;
  visibleFields?: ReadonlySet<keyof EntryDraft>;
  yvaLabel?: string;
};

export function EntryMetaScoreFields({
  entryDraft,
  isPending,
  updateField,
  showMerit,
  showOther,
  visibleFields,
  yvaLabel,
  showHeading = true,
}: Props) {
  const visible = (field: keyof EntryDraft) =>
    !visibleFields || visibleFields.has(field);
  const showDrive =
    showMerit &&
    (visible("hyvaksytytAjominuutit") ||
      visible("ajoajanPisteet") ||
      visible("yva"));
  const showMisc =
    (showMerit && visible("ansiopisteetYhteensa")) ||
    (showOther && (visible("tja") || visible("pin")));

  return (
    <section className="space-y-2">
      {showHeading ? (
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Ansiopisteet
        </h4>
      ) : null}
      <div className="space-y-4">
        {showDrive ? (
          <ScoreSubsection title="Ajo">
            {visible("hyvaksytytAjominuutit") ? (
              <TextField
                label="Hyväksytyt ajominuutit"
                value={entryDraft.hyvaksytytAjominuutit}
                inputMode="numeric"
                disabled={isPending}
                onChange={(value) =>
                  updateField("hyvaksytytAjominuutit", value)
                }
              />
            ) : null}
            {visible("ajoajanPisteet") ? (
              <TextField
                label="Ajoajan pisteet"
                value={entryDraft.ajoajanPisteet}
                inputMode="decimal"
                disabled={isPending}
                onChange={(value) => updateField("ajoajanPisteet", value)}
              />
            ) : null}
            {visible("yva") ? (
              <TextField
                label={yvaLabel ?? "Ajotaito / yleisvaikutelma"}
                value={entryDraft.yva}
                inputMode="decimal"
                disabled={isPending}
                onChange={(value) => updateField("yva", value)}
              />
            ) : null}
          </ScoreSubsection>
        ) : null}
        {showOther && visible("haku") ? (
          <ScoreSubsection title="Haku">
            <TextField
              label="Haku"
              value={entryDraft.haku}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("haku", value)}
            />
          </ScoreSubsection>
        ) : null}
        {showOther && visible("hauk") ? (
          <ScoreSubsection title="Haukku">
            <TextField
              label="Haukku"
              value={entryDraft.hauk}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("hauk", value)}
            />
          </ScoreSubsection>
        ) : null}
        {showMisc ? (
          <ScoreSubsection title="Muut">
            {showMerit && visible("ansiopisteetYhteensa") ? (
              <TextField
                label="Ansiopisteet yhteensä"
                value={entryDraft.ansiopisteetYhteensa}
                inputMode="decimal"
                disabled={isPending}
                onChange={(value) => updateField("ansiopisteetYhteensa", value)}
              />
            ) : null}
            {showOther && visible("tja") ? (
              <TextField
                label="Tie ja estetyöskentely"
                value={entryDraft.tja}
                inputMode="decimal"
                disabled={isPending}
                onChange={(value) => updateField("tja", value)}
              />
            ) : null}
            {showOther && visible("pin") ? (
              <TextField
                label="Metsästysinto"
                value={entryDraft.pin}
                inputMode="decimal"
                disabled={isPending}
                onChange={(value) => updateField("pin", value)}
              />
            ) : null}
          </ScoreSubsection>
        ) : null}
      </div>
    </section>
  );
}

function ScoreSubsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-md border border-dashed border-muted-foreground/40 p-3">
      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h5>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}
