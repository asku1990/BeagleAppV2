"use client";

import React, { useMemo, useState } from "react";
import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import type { AdminTrialEventDetails } from "@beagle/contracts";
import {
  areTrialEventDraftsEqual,
  parseSklKoeIdDraft,
  toTrialEventDraft,
} from "./admin-trial-event-edit-dialog-helpers";
import { AdminTrialEventFormFields } from "./admin-trial-event-form-fields";

export type UpdateAdminTrialEventPayload = {
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number | null;
};

type Props = {
  open: boolean;
  selectedEvent: AdminTrialEventDetails;
  isPending: boolean;
  errorText: string | null;
  onClose: () => void;
  onSave: (payload: UpdateAdminTrialEventPayload) => Promise<boolean>;
};

export function AdminTrialEventEditDialog({
  open,
  selectedEvent,
  isPending,
  errorText,
  onClose,
  onSave,
}: Props) {
  const selectedEventKey = useMemo(
    () =>
      [
        selectedEvent.trialEventId,
        selectedEvent.eventDate,
        selectedEvent.eventPlace,
        selectedEvent.jarjestaja ?? "",
        selectedEvent.ylituomari ?? "",
        selectedEvent.ylituomariNumero ?? "",
        selectedEvent.ytKertomus ?? "",
        selectedEvent.kennelpiiri ?? "",
        selectedEvent.kennelpiirinro ?? "",
        selectedEvent.sklKoeId ?? "",
      ].join("|"),
    [selectedEvent],
  );

  return (
    <AdminTrialEventEditDialogContent
      key={selectedEventKey}
      open={open}
      selectedEvent={selectedEvent}
      isPending={isPending}
      errorText={errorText}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AdminTrialEventEditDialogContent({
  open,
  selectedEvent,
  isPending,
  errorText,
  onClose,
  onSave,
}: Props) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => toTrialEventDraft(selectedEvent));
  const [validationError, setValidationError] = useState<string | null>(null);
  const isDirty = useMemo(
    () => !areTrialEventDraftsEqual(selectedEvent, draft),
    [selectedEvent, draft],
  );

  const eventDate = draft.eventDate.trim();
  const eventPlace = draft.eventPlace.trim();
  const jarjestaja = draft.jarjestaja.trim();
  const ylituomari = draft.ylituomari.trim();
  const ylituomariNumero = draft.ylituomariNumero.trim();
  const ytKertomus = draft.ytKertomus.trim();
  const kennelpiiri = draft.kennelpiiri.trim();
  const kennelpiirinro = draft.kennelpiirinro.trim();
  const sklKoeIdRaw = draft.sklKoeId.trim();

  function resetDraft() {
    setDraft(toTrialEventDraft(selectedEvent));
    setValidationError(null);
  }

  return (
    <AdminFormModalShell
      open={open}
      onClose={() => {
        resetDraft();
        onClose();
      }}
      title={t("admin.trials.manage.eventModal.title")}
      ariaLabel={t("admin.trials.manage.eventModal.aria")}
      contentClassName="max-w-xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetDraft();
              onClose();
            }}
          >
            {t("admin.trials.manage.eventModal.close")}
          </Button>
          <Button
            type="button"
            disabled={isPending || !isDirty}
            onClick={() =>
              void (async () => {
                setValidationError(null);

                if (!eventDate) {
                  setValidationError(
                    t("admin.trials.manage.eventModal.validation.invalidDate"),
                  );
                  return;
                }

                if (!eventPlace) {
                  setValidationError(
                    t(
                      "admin.trials.manage.eventModal.validation.requiredPlace",
                    ),
                  );
                  return;
                }

                let sklKoeId: number | null = null;
                if (sklKoeIdRaw.length > 0) {
                  const parsed = parseSklKoeIdDraft(sklKoeIdRaw);
                  if (parsed === null) {
                    setValidationError(
                      t(
                        "admin.trials.manage.eventModal.validation.invalidSklKoeId",
                      ),
                    );
                    return;
                  }

                  sklKoeId = parsed;
                }

                const ok = await onSave({
                  trialEventId: selectedEvent.trialEventId,
                  eventDate,
                  eventPlace,
                  jarjestaja: jarjestaja || null,
                  ylituomari: ylituomari || null,
                  ylituomariNumero: ylituomariNumero || null,
                  ytKertomus: ytKertomus || null,
                  kennelpiiri: kennelpiiri || null,
                  kennelpiirinro: kennelpiirinro || null,
                  sklKoeId,
                });
                if (ok) {
                  resetDraft();
                  onClose();
                }
              })()
            }
          >
            {isPending
              ? t("admin.trials.manage.eventModal.saving")
              : t("admin.trials.manage.eventModal.save")}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {validationError ? (
          <p className="text-sm text-destructive">{validationError}</p>
        ) : null}
        {errorText ? (
          <p className="text-sm text-destructive">{errorText}</p>
        ) : null}
      </div>
      <AdminTrialEventFormFields
        draft={draft}
        disabled={isPending}
        onChange={setDraft}
        showJudgeUpdateHelp
      />
    </AdminFormModalShell>
  );
}
