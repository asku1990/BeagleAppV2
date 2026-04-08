"use client";

import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { draft: draftEvent, setDraft: setDraftEvent } = useModalDraftState(
    () => cloneManageShowEvent(selectedEvent),
  );
  const isDirty = !areShowEventFieldsEqual(draftEvent, selectedEvent);

  return (
    <AdminFormModalShell
      open={open}
      onClose={onClose}
      title="Edit event"
      ariaLabel="Edit event"
      contentClassName="max-w-xl"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
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
            {isApplying ? "Saving event..." : "Save event"}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Date</span>
          <Input
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
          <span>Place</span>
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
          <span>City</span>
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
          <span>Type</span>
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
          <span>Name</span>
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
          <span>Organizer</span>
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
          <span>Judge</span>
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
