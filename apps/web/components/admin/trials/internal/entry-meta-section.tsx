import React from "react";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { EntryMetaBasicFields } from "./entry-meta-basic-fields";
import { EntryMetaJudgeFields } from "./entry-meta-judge-fields";
import { EntryMetaLossFields } from "./entry-meta-loss-fields";
import { EntryMetaResultFields } from "./entry-meta-result-fields";
import { EntryMetaScoreFields } from "./entry-meta-score-fields";

type EntryMetaGroup = "basic" | "result" | "merit" | "other" | "judges";

type Props = {
  entryDraft: EntryDraft;
  isPending: boolean;
  onChange: (updater: (current: EntryDraft) => EntryDraft) => void;
  visibleFields?: ReadonlySet<keyof EntryDraft>;
  yvaLabel?: string;
  groups?: readonly EntryMetaGroup[];
  showHeadings?: boolean;
};

export function EntryMetaSection({
  entryDraft,
  isPending,
  onChange,
  visibleFields,
  yvaLabel,
  groups,
  showHeadings = true,
}: Props) {
  const updateField = (field: keyof EntryDraft, value: string) => {
    onChange((current) => ({
      ...current,
      [field]: value,
    }));
  };
  const show = (group: EntryMetaGroup) => !groups || groups.includes(group);
  const fieldGroupProps = {
    entryDraft,
    isPending,
    updateField,
    visibleFields,
    showHeading: showHeadings,
  };
  const showMerit = show("merit");
  const showOther = show("other");
  const hasVisible = (fields: readonly (keyof EntryDraft)[]) =>
    !visibleFields || fields.some((field) => visibleFields.has(field));
  const showScoreFields =
    (showMerit || showOther) &&
    hasVisible([
      "hyvaksytytAjominuutit",
      "ajoajanPisteet",
      "haku",
      "hauk",
      "yva",
      "ansiopisteetYhteensa",
      "tja",
      "pin",
    ]);
  const showLossFields =
    showOther && hasVisible(["hlo", "alo", "tappiopisteetYhteensa"]);

  return (
    <div className="space-y-4">
      {show("basic") ? <EntryMetaBasicFields {...fieldGroupProps} /> : null}
      {show("result") ? (
        <EntryMetaResultFields
          {...fieldGroupProps}
          showWeather={Boolean(groups && !groups.includes("basic"))}
        />
      ) : null}
      {showScoreFields ? (
        <EntryMetaScoreFields
          {...fieldGroupProps}
          showMerit={showMerit}
          showOther={showOther}
          yvaLabel={yvaLabel}
        />
      ) : null}
      {showLossFields ? <EntryMetaLossFields {...fieldGroupProps} /> : null}
      {show("judges") ? <EntryMetaJudgeFields {...fieldGroupProps} /> : null}
    </div>
  );
}
