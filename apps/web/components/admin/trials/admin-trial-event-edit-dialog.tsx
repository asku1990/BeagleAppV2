"use client";

import { useMemo, useState } from "react";
import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import type { AdminTrialEventDetails } from "@beagle/contracts";

type TrialEventDraft = {
  eventDate: string;
  eventPlace: string;
  organizer: string;
  judge: string;
  sklKoeId: string;
};

function toDraft(event: AdminTrialEventDetails): TrialEventDraft {
  return {
    eventDate: event.eventDate,
    eventPlace: event.eventPlace,
    organizer: event.organizer ?? "",
    judge: event.judge ?? "",
    sklKoeId: event.sklKoeId === null ? "" : String(event.sklKoeId),
  };
}

function areEqual(
  left: AdminTrialEventDetails,
  right: TrialEventDraft,
): boolean {
  return (
    left.eventDate === right.eventDate &&
    left.eventPlace === right.eventPlace &&
    (left.organizer ?? "") === right.organizer &&
    (left.judge ?? "") === right.judge &&
    (left.sklKoeId === null ? "" : String(left.sklKoeId)) === right.sklKoeId
  );
}

export type UpdateAdminTrialEventPayload = {
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  eventName: string | null;
  organizer: string | null;
  judge: string | null;
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
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => toDraft(selectedEvent));
  const [validationError, setValidationError] = useState<string | null>(null);
  const isDirty = useMemo(
    () => !areEqual(selectedEvent, draft),
    [selectedEvent, draft],
  );

  const eventDate = draft.eventDate.trim();
  const eventPlace = draft.eventPlace.trim();
  const organizer = draft.organizer.trim();
  const judge = draft.judge.trim();
  const sklKoeIdRaw = draft.sklKoeId.trim();

  function resetDraft() {
    setDraft(toDraft(selectedEvent));
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
                  const parsed = Number.parseInt(sklKoeIdRaw, 10);
                  if (
                    !Number.isInteger(parsed) ||
                    !Number.isFinite(parsed) ||
                    parsed < 1
                  ) {
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
                  eventName: null,
                  organizer: organizer || null,
                  judge: judge || null,
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
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.eventModal.fields.eventDate")}</span>
          <Input
            type="date"
            value={draft.eventDate}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                eventDate: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.eventModal.fields.eventPlace")}</span>
          <Input
            value={draft.eventPlace}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                eventPlace: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.eventModal.fields.organizer")}</span>
          <Input
            value={draft.organizer}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                organizer: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.eventModal.fields.judge")}</span>
          <Input
            value={draft.judge}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                judge: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.eventModal.fields.sklKoeId")}</span>
          <Input
            inputMode="numeric"
            value={draft.sklKoeId}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                sklKoeId: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </AdminFormModalShell>
  );
}
