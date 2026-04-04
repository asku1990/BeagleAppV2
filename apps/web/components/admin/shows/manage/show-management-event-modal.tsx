"use client";

import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ManageShowEvent } from "./show-management-types";

export function ShowManagementEventModal({
  open,
  selectedEvent,
  isDirty,
  isApplying,
  onClose,
  onEventFieldChange,
  onApplyEvent,
}: {
  open: boolean;
  selectedEvent: ManageShowEvent | null;
  isDirty: boolean;
  isApplying: boolean;
  onClose: () => void;
  onEventFieldChange: (
    field: keyof Omit<ManageShowEvent, "id" | "entries">,
    value: string,
  ) => void;
  onApplyEvent: () => void;
}) {
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
            onClick={onApplyEvent}
            disabled={isApplying || !isDirty}
          >
            {isApplying ? "Saving event..." : "Save event"}
          </Button>
        </>
      }
    >
      {!selectedEvent ? null : (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Date</span>
            <Input
              value={selectedEvent.eventDate}
              disabled={isApplying}
              onChange={(event) =>
                onEventFieldChange("eventDate", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Place</span>
            <Input
              value={selectedEvent.eventPlace}
              disabled={isApplying}
              onChange={(event) =>
                onEventFieldChange("eventPlace", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>City</span>
            <Input
              value={selectedEvent.eventCity}
              disabled={isApplying}
              onChange={(event) =>
                onEventFieldChange("eventCity", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Type</span>
            <Input
              value={selectedEvent.eventType}
              disabled={isApplying}
              onChange={(event) =>
                onEventFieldChange("eventType", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Name</span>
            <Input
              value={selectedEvent.eventName}
              disabled={isApplying}
              onChange={(event) =>
                onEventFieldChange("eventName", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Organizer</span>
            <Input
              value={selectedEvent.organizer}
              disabled={isApplying}
              onChange={(event) =>
                onEventFieldChange("organizer", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Judge</span>
            <Input
              value={selectedEvent.judge}
              disabled={isApplying}
              onChange={(event) =>
                onEventFieldChange("judge", event.target.value)
              }
            />
          </label>
        </div>
      )}
    </AdminFormModalShell>
  );
}
