"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildEntryDisplayState } from "@/lib/admin/shows/manage";
import { ShowManagementEntryResults } from "./internal/show-management-entry-results";
import { ShowManagementSelectedEventHeader } from "./internal/show-management-selected-event-header";
import { ShowManagementStatusFooter } from "./internal/show-management-status-footer";
import { ShowManagementEntryModal } from "./show-management-entry-modal";
import { ShowManagementEventModal } from "./show-management-event-modal";
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
  onEntryFieldChange: (
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) => void;
  onAddAward: (entryId: string, award: string) => void;
  onRemoveAward: (entryId: string, awardId: string) => void;
  onApplyEvent: () => void;
  onApplyEntry: (entry: ManageShowEntry) => void;
  onRequestRemoveEntry: (entry: ManageShowEntry) => void;
  onResetShell: () => void;
  statusText: string;
  isApplyingEvent: boolean;
  applyingEntryId: string | null;
  isRemovingEntry: boolean;
};

export function ShowManagementEditorPanel({
  selectedEvent,
  resultOptions,
  isEventDirty,
  dirtyEntryIds,
  onEventFieldChange,
  onEntryFieldChange,
  onAddAward,
  onRemoveAward,
  onApplyEvent,
  onApplyEntry,
  onRequestRemoveEntry,
  onResetShell,
  statusText,
  isApplyingEvent,
  applyingEntryId,
  isRemovingEntry,
}: ShowManagementEditorPanelProps) {
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  if (!selectedEvent) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          Select an event from the left.
        </CardContent>
      </Card>
    );
  }

  const isEventInputsDisabled = isApplyingEvent;
  const isResetDisabled =
    isApplyingEvent || Boolean(applyingEntryId) || isRemovingEntry;
  const editingEntry =
    selectedEvent.entries.find((entry) => entry.id === editingEntryId) ?? null;
  const isEditingEntryDirty = editingEntry
    ? dirtyEntryIds.includes(editingEntry.id)
    : false;
  const entryDisplayStates = selectedEvent.entries.reduce<
    Record<
      string,
      {
        classResultText: string;
        qualityText: string;
        pupnText: string;
        awardsText: string;
      }
    >
  >((accumulator, entry) => {
    const displayState = buildEntryDisplayState(entry, resultOptions);
    accumulator[entry.id] = {
      classResultText: displayState.selectedClassResultText,
      qualityText: displayState.selectedQualityText,
      pupnText: displayState.selectedPupnText,
      awardsText: displayState.selectedAwardsText,
    };
    return accumulator;
  }, {});

  function openEntryEditor(entryId: string) {
    if (isApplyingEvent || isRemovingEntry || Boolean(applyingEntryId)) {
      return;
    }
    setEditingEntryId(entryId);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <ShowManagementSelectedEventHeader
          selectedEvent={selectedEvent}
          isEventDirty={isEventDirty}
          isEditDisabled={isEventInputsDisabled || Boolean(applyingEntryId)}
          onEdit={() => setEventModalOpen(true)}
        />

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">Dog evaluations</h3>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.entries.length} dogs
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onResetShell}
              disabled={isResetDisabled}
            >
              Reset changes
            </Button>
          </div>

          <ShowManagementEntryResults
            entries={selectedEvent.entries}
            entryDisplayStates={entryDisplayStates}
            dirtyEntryIds={dirtyEntryIds}
            isApplyingEvent={isApplyingEvent}
            isRemovingEntry={isRemovingEntry}
            applyingEntryId={applyingEntryId}
            onEditEntry={openEntryEditor}
            onRemoveEntry={onRequestRemoveEntry}
          />
        </div>

        <Separator />

        <ShowManagementStatusFooter statusText={statusText} />

        <ShowManagementEventModal
          open={isEventModalOpen}
          selectedEvent={selectedEvent}
          isDirty={isEventDirty}
          isApplying={isApplyingEvent}
          onClose={() => setEventModalOpen(false)}
          onEventFieldChange={onEventFieldChange}
          onApplyEvent={onApplyEvent}
        />

        <ShowManagementEntryModal
          open={Boolean(editingEntry)}
          entry={editingEntry}
          resultOptions={resultOptions}
          isDirty={isEditingEntryDirty}
          isApplying={isApplyingEvent || applyingEntryId === editingEntry?.id}
          onClose={() => setEditingEntryId(null)}
          onEntryFieldChange={onEntryFieldChange}
          onAddAward={onAddAward}
          onRemoveAward={onRemoveAward}
          onApplyEntry={onApplyEntry}
        />
      </CardContent>
    </Card>
  );
}
