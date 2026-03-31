"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShowManagementEntryCard } from "./show-management-entry-card";
import type { ManageShowEntry, ManageShowEvent } from "./show-management-types";

type ShowManagementEditorPanelProps = {
  selectedEvent: ManageShowEvent | null;
  onEventFieldChange: (
    field: keyof Omit<ManageShowEvent, "id" | "entries">,
    value: string,
  ) => void;
  onEntryChange: (
    entryId: string,
    patch: Partial<Omit<ManageShowEntry, "id">>,
  ) => void;
  onRequestRemoveEntry: (entry: ManageShowEntry) => void;
  onResetShell: () => void;
  onSaveDraft: () => void;
  statusText: string;
};

export function ShowManagementEditorPanel({
  selectedEvent,
  onEventFieldChange,
  onEntryChange,
  onRequestRemoveEntry,
  onResetShell,
  onSaveDraft,
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
              Reset demo
            </Button>
          </div>

          <div className="space-y-3">
            {selectedEvent.entries.map((entry) => (
              <ShowManagementEntryCard
                key={entry.id}
                entry={entry}
                onChange={onEntryChange}
                onRemove={onRequestRemoveEntry}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {statusText || "Draft changes are local."}
          </p>
          <Button type="button" onClick={onSaveDraft}>
            Save draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
