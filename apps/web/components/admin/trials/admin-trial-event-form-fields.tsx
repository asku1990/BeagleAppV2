"use client";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import type { TrialEventDraft } from "./admin-trial-event-edit-dialog-helpers";

type AdminTrialEventFormFieldsProps = {
  draft: TrialEventDraft;
  disabled: boolean;
  onChange: (draft: TrialEventDraft) => void;
  showJudgeUpdateHelp?: boolean;
  requireSklKoeId?: boolean;
};

export function AdminTrialEventFormFields({
  draft,
  disabled,
  onChange,
  showJudgeUpdateHelp = false,
  requireSklKoeId = false,
}: AdminTrialEventFormFieldsProps) {
  const { t } = useI18n();

  function setField<Field extends keyof TrialEventDraft>(
    field: Field,
    value: TrialEventDraft[Field],
  ) {
    onChange({ ...draft, [field]: value });
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="space-y-1 text-sm">
        <span>{t("admin.trials.manage.eventModal.fields.eventDate")}</span>
        <Input
          type="date"
          value={draft.eventDate}
          disabled={disabled}
          required
          onChange={(event) => setField("eventDate", event.target.value)}
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.trials.manage.eventModal.fields.eventPlace")}</span>
        <Input
          value={draft.eventPlace}
          disabled={disabled}
          required
          onChange={(event) => setField("eventPlace", event.target.value)}
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.trials.manage.eventModal.fields.jarjestaja")}</span>
        <Input
          value={draft.jarjestaja}
          disabled={disabled}
          onChange={(event) => setField("jarjestaja", event.target.value)}
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.trials.manage.eventModal.fields.ylituomari")}</span>
        <Input
          value={draft.ylituomari}
          disabled={disabled}
          onChange={(event) => setField("ylituomari", event.target.value)}
        />
        {showJudgeUpdateHelp ? (
          <span className="block text-xs text-muted-foreground">
            {t("admin.trials.manage.eventModal.fields.ylituomariHelp")}
          </span>
        ) : null}
      </label>
      <label className="space-y-1 text-sm">
        <span>
          {t("admin.trials.manage.eventModal.fields.ylituomariNumero")}
        </span>
        <Input
          value={draft.ylituomariNumero}
          disabled={disabled}
          onChange={(event) => setField("ylituomariNumero", event.target.value)}
        />
      </label>
      <label className="space-y-1 text-sm md:col-span-2">
        <span>{t("admin.trials.manage.eventModal.fields.ytKertomus")}</span>
        <textarea
          value={draft.ytKertomus}
          disabled={disabled}
          onChange={(event) => setField("ytKertomus", event.target.value)}
          className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.trials.manage.eventModal.fields.kennelpiiri")}</span>
        <Input
          value={draft.kennelpiiri}
          disabled={disabled}
          onChange={(event) => setField("kennelpiiri", event.target.value)}
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.trials.manage.eventModal.fields.kennelpiirinro")}</span>
        <Input
          value={draft.kennelpiirinro}
          disabled={disabled}
          onChange={(event) => setField("kennelpiirinro", event.target.value)}
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.trials.manage.eventModal.fields.sklKoeId")}</span>
        <Input
          inputMode="numeric"
          value={draft.sklKoeId}
          disabled={disabled}
          required={requireSklKoeId}
          onChange={(event) => setField("sklKoeId", event.target.value)}
        />
      </label>
    </div>
  );
}
