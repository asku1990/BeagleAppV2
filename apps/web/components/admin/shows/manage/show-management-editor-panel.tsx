"use client";

import React from "react";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Separator } from "@web/components/ui/separator";
import { ShowManagementEntryCard } from "./show-management-entry-card";
import type {
  ManageShowEditOptions,
  ManageShowEntry,
  ManageShowEvent,
} from "./show-management-types";

type ShowManagementEditorPanelProps = {
  selectedEvent: ManageShowEvent | null;
  resultOptions: ManageShowEditOptions;
  isEventDirty: boolean;
  dirtyEntryIds: string[];
  onEventFieldChange: (
    field: keyof Omit<ManageShowEvent, "id" | "entries">,
    value: string,
  ) => void;
  onEntryChange: (
    entryId: string,
    patch: Partial<Omit<ManageShowEntry, "id">>,
  ) => void;
  onAddAward: (entryId: string, award: string) => void;
  onRemoveAward: (entryId: string, index: number) => void;
  onApplyEvent: () => void;
  onApplyEntry: (entry: ManageShowEntry) => void;
  onRequestRemoveEntry: (entry: ManageShowEntry) => void;
  onResetShell: () => void;
  statusText: string;
};

export function ShowManagementEditorPanel({
  selectedEvent,
  resultOptions,
  isEventDirty,
  dirtyEntryIds,
  onEventFieldChange,
  onEntryChange,
  onAddAward,
  onRemoveAward,
  onApplyEvent,
  onApplyEntry,
  onRequestRemoveEntry,
  onResetShell,
  statusText,
}: ShowManagementEditorPanelProps) {
  if (!selectedEvent) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          Select an event from the left.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Selected event</p>
          <h2 className="text-lg font-semibold">{selectedEvent.eventPlace}</h2>
          <p className="text-sm text-muted-foreground">
            {selectedEvent.eventDate} · {selectedEvent.eventName}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Date</span>
            <Input
              value={selectedEvent.eventDate}
              onChange={(event) =>
                onEventFieldChange("eventDate", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Place</span>
            <Input
              value={selectedEvent.eventPlace}
              onChange={(event) =>
                onEventFieldChange("eventPlace", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>City</span>
            <Input
              value={selectedEvent.eventCity}
              onChange={(event) =>
                onEventFieldChange("eventCity", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Type</span>
            <Input
              value={selectedEvent.eventType}
              onChange={(event) =>
                onEventFieldChange("eventType", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Name</span>
            <Input
              value={selectedEvent.eventName}
              onChange={(event) =>
                onEventFieldChange("eventName", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Organizer</span>
            <Input
              value={selectedEvent.organizer}
              onChange={(event) =>
                onEventFieldChange("organizer", event.target.value)
              }
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Judge</span>
            <Input
              value={selectedEvent.judge}
              onChange={(event) =>
                onEventFieldChange("judge", event.target.value)
              }
            />
          </label>
        </div>

        {isEventDirty ? (
          <div className="flex justify-end">
            <Button type="button" onClick={onApplyEvent}>
              Apply event changes
            </Button>
          </div>
        ) : null}

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">Dog evaluations</h3>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.entries.length} dogs
              </p>
            </div>
            <Button type="button" variant="outline" onClick={onResetShell}>
              Reset changes
            </Button>
          </div>

          <div className="space-y-3">
            {selectedEvent.entries.map((entry) => (
              <ShowManagementEntryCard
                key={entry.id}
                entry={entry}
                resultOptions={resultOptions}
                isDirty={dirtyEntryIds.includes(entry.id)}
                onChange={onEntryChange}
                onAddAward={onAddAward}
                onRemoveAward={onRemoveAward}
                onRemove={onRequestRemoveEntry}
                onApply={onApplyEntry}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {statusText || "No unsaved changes."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
