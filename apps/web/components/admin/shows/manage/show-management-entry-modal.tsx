"use client";

import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import {
  buildEntryDisplayState,
  resolveOptionLabel,
} from "@/lib/admin/shows/manage";
import { ShowManagementAwardsEditor } from "./internal/show-management-awards-editor";
import { ShowManagementCritiqueField } from "./internal/show-management-critique-field";
import { ShowManagementResultFieldsGrid } from "./internal/show-management-result-fields-grid";
import type {
  ManageShowEditOptions,
  ManageShowEntry,
} from "./show-management-types";

export function ShowManagementEntryModal({
  open,
  entry,
  resultOptions,
  isDirty,
  isApplying,
  onClose,
  onEntryFieldChange,
  onAddAward,
  onRemoveAward,
  onApplyEntry,
}: {
  open: boolean;
  entry: ManageShowEntry | null;
  resultOptions: ManageShowEditOptions;
  isDirty: boolean;
  isApplying: boolean;
  onClose: () => void;
  onEntryFieldChange: (
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) => void;
  onAddAward: (entryId: string, awardCode: string) => void;
  onRemoveAward: (entryId: string, awardId: string) => void;
  onApplyEntry: (entry: ManageShowEntry) => void;
}) {
  if (!entry) {
    return null;
  }

  const displayState = buildEntryDisplayState(entry, resultOptions);
  const optionsUnavailable =
    resultOptions.classOptions.length === 0 &&
    resultOptions.qualityOptions.length === 0 &&
    resultOptions.awardOptions.length === 0 &&
    resultOptions.pupnOptions.length === 0;
  const resolveAwardLabel = (value: string) =>
    resolveOptionLabel(displayState.awardLabelLookup, value);

  return (
    <AdminFormModalShell
      open={open}
      onClose={onClose}
      title={entry.dogName}
      ariaLabel="Edit entry"
      contentClassName="max-h-[90vh] max-w-3xl overflow-y-auto"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            onClick={() => onApplyEntry(entry)}
            disabled={isApplying || !isDirty}
          >
            {isApplying ? "Saving entry..." : "Save entry"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{entry.registrationNo}</p>
      <p
        className={
          entry.dogId
            ? "text-xs text-muted-foreground"
            : "text-xs text-amber-700"
        }
      >
        {entry.dogId
          ? "Linked to dog record"
          : "Using snapshot (dog not linked)"}
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <ShowManagementResultFieldsGrid
          entry={entry}
          classOptions={displayState.classOptions}
          qualityOptions={displayState.qualityOptions}
          isDisabled={isApplying}
          onEntryFieldChange={onEntryFieldChange}
        />

        <ShowManagementAwardsEditor
          entry={entry}
          availableAwardOptions={displayState.availableAwardOptions}
          awardsDisabled={displayState.awardsDisabled}
          isDisabled={isApplying}
          onAddAward={onAddAward}
          onRemoveAward={onRemoveAward}
          resolveAwardLabel={resolveAwardLabel}
        />

        <ShowManagementCritiqueField
          entry={entry}
          isDisabled={isApplying}
          onEntryFieldChange={onEntryFieldChange}
        />
      </div>

      {optionsUnavailable ? (
        <p className="text-xs text-destructive">
          Result options are currently unavailable from the database.
        </p>
      ) : null}
    </AdminFormModalShell>
  );
}
