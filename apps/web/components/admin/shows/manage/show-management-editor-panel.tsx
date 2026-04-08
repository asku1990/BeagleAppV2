"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/hooks/i18n";
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
  onApplyEvent: (event: ManageShowEvent) => Promise<boolean>;
  onApplyEntry: (entry: ManageShowEntry) => Promise<boolean>;
  onRequestRemoveEntry: (entry: ManageShowEntry) => void;
  statusText: string;
  isApplyingEvent: boolean;
  applyingEntryId: string | null;
  isRemovingEntry: boolean;
};

export function ShowManagementEditorPanel({
  selectedEvent,
  resultOptions,
  onApplyEvent,
  onApplyEntry,
  onRequestRemoveEntry,
  statusText,
  isApplyingEvent,
  applyingEntryId,
  isRemovingEntry,
}: ShowManagementEditorPanelProps) {
  const { t } = useI18n();
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventSnapshot, setEditingEventSnapshot] =
    useState<ManageShowEvent | null>(null);
  const [editingEntrySnapshot, setEditingEntrySnapshot] =
    useState<ManageShowEntry | null>(null);

  if (!selectedEvent) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          {t("admin.shows.manage.editor.empty")}
        </CardContent>
      </Card>
    );
  }

  const isEventInputsDisabled = isApplyingEvent;
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
    const currentEvent = selectedEvent;
    if (!currentEvent) {
      return;
    }

    const entry = currentEvent.entries.find((item) => item.id === entryId);
    if (!entry) {
      return;
    }
    setEditingEntrySnapshot(entry);
  }

  function openEventEditor() {
    if (isApplyingEvent || Boolean(applyingEntryId) || isRemovingEntry) {
      return;
    }
    if (!selectedEvent) {
      return;
    }
    setEditingEventSnapshot(selectedEvent);
    setEventModalOpen(true);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <ShowManagementSelectedEventHeader
          selectedEvent={selectedEvent}
          isEditDisabled={isEventInputsDisabled || Boolean(applyingEntryId)}
          onEdit={openEventEditor}
        />

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">
                {t("admin.shows.manage.editor.dogEvaluations")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.entries.length}{" "}
                {t("admin.shows.manage.editor.dogCountSuffix")}
              </p>
            </div>
          </div>

          <ShowManagementEntryResults
            entries={selectedEvent.entries}
            entryDisplayStates={entryDisplayStates}
            isApplyingEvent={isApplyingEvent}
            isRemovingEntry={isRemovingEntry}
            applyingEntryId={applyingEntryId}
            onEditEntry={openEntryEditor}
            onRemoveEntry={onRequestRemoveEntry}
          />
        </div>

        <Separator />

        <ShowManagementStatusFooter statusText={statusText} />

        {isEventModalOpen && editingEventSnapshot ? (
          <ShowManagementEventModal
            open={isEventModalOpen}
            selectedEvent={editingEventSnapshot}
            isApplying={isApplyingEvent}
            onClose={() => {
              setEventModalOpen(false);
              setEditingEventSnapshot(null);
            }}
            onApplyEvent={onApplyEvent}
          />
        ) : null}

        {editingEntrySnapshot ? (
          <ShowManagementEntryModal
            open={Boolean(editingEntrySnapshot)}
            entry={editingEntrySnapshot}
            resultOptions={resultOptions}
            isApplying={
              isApplyingEvent || applyingEntryId === editingEntrySnapshot.id
            }
            onClose={() => setEditingEntrySnapshot(null)}
            onApplyEntry={onApplyEntry}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
