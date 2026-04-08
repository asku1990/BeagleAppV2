"use client";

import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import {
  areShowEventFieldsEqual,
  cloneManageShowEvent,
} from "@/lib/admin/shows/manage";
import { useModalDraftState } from "@/hooks/admin/shows/manage/use-modal-draft-state";
import type { ManageShowEvent } from "./show-management-types";

export function ShowManagementEventModal({
  open,
  selectedEvent,
  isApplying,
  onClose,
  onApplyEvent,
}: {
  open: boolean;
  selectedEvent: ManageShowEvent;
  isApplying: boolean;
  onClose: () => void;
  onApplyEvent: (draftEvent: ManageShowEvent) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const { draft: draftEvent, setDraft: setDraftEvent } = useModalDraftState(
    () => cloneManageShowEvent(selectedEvent),
  );
  const isDirty = !areShowEventFieldsEqual(draftEvent, selectedEvent);

  return (
    <AdminFormModalShell
      open={open}
      onClose={onClose}
      title={t("admin.shows.manage.eventModal.title")}
      ariaLabel={t("admin.shows.manage.eventModal.aria")}
      contentClassName="max-w-xl"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("admin.shows.manage.eventModal.close")}
          </Button>
          <Button
            type="button"
            onClick={() =>
              void (async () => {
                if (await onApplyEvent(draftEvent)) {
                  onClose();
                }
              })()
            }
            disabled={isApplying || !isDirty}
          >
            {isApplying
              ? t("admin.shows.manage.eventModal.saving")
              : t("admin.shows.manage.eventModal.save")}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>{t("admin.shows.manage.results.date")}</span>
          <Input
            type="date"
            value={draftEvent.eventDate}
            disabled={isApplying}
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                eventDate: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.shows.manage.results.place")}</span>
          <Input
            value={draftEvent.eventPlace}
            disabled={isApplying}
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                eventPlace: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.shows.manage.results.city")}</span>
          <Input
            value={draftEvent.eventCity}
            disabled={isApplying}
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                eventCity: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.shows.manage.results.type")}</span>
          <Input
            value={draftEvent.eventType}
            disabled={isApplying}
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                eventType: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.shows.manage.results.event")}</span>
          <Input
            value={draftEvent.eventName}
            disabled={isApplying}
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                eventName: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("admin.shows.manage.results.organizer")}</span>
          <Input
            value={draftEvent.organizer}
            disabled={isApplying}
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                organizer: event.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 text-sm md:col-span-2">
          <span>{t("admin.shows.manage.results.judge")}</span>
          <Input
            value={draftEvent.judge}
            disabled={isApplying}
            onChange={(event) =>
              setDraftEvent((current) => ({
                ...current,
                judge: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </AdminFormModalShell>
  );
}
