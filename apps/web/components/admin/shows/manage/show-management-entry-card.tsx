"use client";

import React from "react";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import {
  buildEntryDisplayState,
  getEntryRenderLog,
  resolveOptionLabel,
} from "@web/lib/admin/shows/manage";
import { ShowManagementAwardsEditor } from "./internal/show-management-awards-editor";
import { ShowManagementCritiqueField } from "./internal/show-management-critique-field";
import { ShowManagementEntryHeader } from "./internal/show-management-entry-header";
import { ShowManagementEntrySummary } from "./internal/show-management-entry-summary";
import { ShowManagementResultFieldsGrid } from "./internal/show-management-result-fields-grid";
import type {
  ManageShowEditOptions,
  ManageShowEntry,
} from "./show-management-types";

type ShowManagementEntryCardProps = {
  entry: ManageShowEntry;
  resultOptions: ManageShowEditOptions;
  isDirty: boolean;
  onEntryFieldChange: (
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) => void;
  onAddAward: (entryId: string, awardCode: string) => void;
  onRemoveAward: (entryId: string, awardId: string) => void;
  onRemove: (entry: ManageShowEntry) => void;
  onApply: (entry: ManageShowEntry) => void;
};

export function ShowManagementEntryCard({
  entry,
  resultOptions,
  isDirty,
  onEntryFieldChange,
  onAddAward,
  onRemoveAward,
  onRemove,
  onApply,
}: ShowManagementEntryCardProps) {
  const optionsUnavailable =
    resultOptions.classOptions.length === 0 &&
    resultOptions.qualityOptions.length === 0 &&
    resultOptions.awardOptions.length === 0 &&
    resultOptions.pupnOptions.length === 0;
  const displayState = buildEntryDisplayState(entry, resultOptions);
  const resolveAwardLabel = (value: string) =>
    resolveOptionLabel(displayState.awardLabelLookup, value);

  console.info(
    "[show-manage][entry-card][render]",
    getEntryRenderLog(entry, displayState.awardLabelLookup),
  );

  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <ShowManagementEntryHeader entry={entry} onRemove={onRemove} />

        <ShowManagementEntrySummary
          classResultText={displayState.selectedClassResultText}
          qualityText={displayState.selectedQualityText}
          pupnText={displayState.selectedPupnText}
          awardsText={displayState.selectedAwardsText}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <ShowManagementResultFieldsGrid
            entry={entry}
            classOptions={displayState.classOptions}
            qualityOptions={displayState.qualityOptions}
            onEntryFieldChange={onEntryFieldChange}
          />

          <ShowManagementAwardsEditor
            entry={entry}
            availableAwardOptions={displayState.availableAwardOptions}
            awardsDisabled={displayState.awardsDisabled}
            awardLabelLookup={displayState.awardLabelLookup}
            onAddAward={onAddAward}
            onRemoveAward={onRemoveAward}
            resolveAwardLabel={resolveAwardLabel}
          />

          <ShowManagementCritiqueField
            entry={entry}
            onEntryFieldChange={onEntryFieldChange}
          />
        </div>

        {optionsUnavailable ? (
          <p className="text-xs text-destructive">
            Result options are currently unavailable from the database.
          </p>
        ) : null}

        {isDirty ? (
          <div className="flex justify-end">
            <Button type="button" onClick={() => onApply(entry)}>
              Apply entry changes
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
