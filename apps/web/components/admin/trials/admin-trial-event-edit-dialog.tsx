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
  jarjestaja: string;
  ylituomari: string;
  ylituomariNumero: string;
  ytKertomus: string;
  kennelpiiri: string;
  kennelpiirinro: string;
  sklKoeId: string;
};

function toDraft(event: AdminTrialEventDetails): TrialEventDraft {
  return {
    eventDate: event.eventDate,
    eventPlace: event.eventPlace,
    jarjestaja: event.jarjestaja ?? "",
    ylituomari: event.ylituomari ?? "",
    ylituomariNumero: event.ylituomariNumero ?? "",
    ytKertomus: event.ytKertomus ?? "",
    kennelpiiri: event.kennelpiiri ?? "",
    kennelpiirinro: event.kennelpiirinro ?? "",
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
    (left.jarjestaja ?? "") === right.jarjestaja &&
    (left.ylituomari ?? "") === right.ylituomari &&
    (left.ylituomariNumero ?? "") === right.ylituomariNumero &&
    (left.ytKertomus ?? "") === right.ytKertomus &&
    (left.kennelpiiri ?? "") === right.kennelpiiri &&
    (left.kennelpiirinro ?? "") === right.kennelpiirinro &&
    (left.sklKoeId === null ? "" : String(left.sklKoeId)) === right.sklKoeId
  );
}

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
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => toDraft(selectedEvent));
  const [validationError, setValidationError] = useState<string | null>(null);
  const isDirty = useMemo(
    () => !areEqual(selectedEvent, draft),
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
          <span>{t("admin.trials.manage.eventModal.fields.jarjestaja")}</span>
          <Input
            value={draft.jarjestaja}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                jarjestaja: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.eventModal.fields.ylituomari")}</span>
          <Input
            value={draft.ylituomari}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                ylituomari: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>
            {t("admin.trials.manage.eventModal.fields.ylituomariNumero")}
          </span>
          <Input
            value={draft.ylituomariNumero}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                ylituomariNumero: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm md:col-span-2">
          <span>{t("admin.trials.manage.eventModal.fields.ytKertomus")}</span>
          <textarea
            value={draft.ytKertomus}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                ytKertomus: event.target.value,
              }))
            }
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.eventModal.fields.kennelpiiri")}</span>
          <Input
            value={draft.kennelpiiri}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                kennelpiiri: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>
            {t("admin.trials.manage.eventModal.fields.kennelpiirinro")}
          </span>
          <Input
            value={draft.kennelpiirinro}
            disabled={isPending}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                kennelpiirinro: event.target.value,
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
