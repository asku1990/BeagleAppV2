"use client";

import React from "react";
import type { AdminShowResultOption } from "@beagle/contracts";
import { getAwardLogEntries } from "@web/lib/admin/shows/manage";
import type { OptionLabelLookup } from "@web/lib/admin/shows/manage/display";
import type {
  ManageShowAward,
  ManageShowEntry,
} from "../show-management-types";

type ShowManagementAwardsEditorProps = {
  entry: ManageShowEntry;
  availableAwardOptions: AdminShowResultOption[];
  awardsDisabled: boolean;
  awardLabelLookup: OptionLabelLookup;
  onAddAward: (entryId: string, awardCode: string) => void;
  onRemoveAward: (entryId: string, awardId: string) => void;
  resolveAwardLabel: (value: string) => string;
};

export function ShowManagementAwardsEditor({
  entry,
  availableAwardOptions,
  awardsDisabled,
  awardLabelLookup,
  onAddAward,
  onRemoveAward,
  resolveAwardLabel,
}: ShowManagementAwardsEditorProps) {
  return (
    <div className="space-y-1 text-sm">
      <span className="block">Awards</span>
      <div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
        {entry.awards.length === 0 ? (
          <span className="text-xs text-muted-foreground">-</span>
        ) : (
          entry.awards.map((award) => (
            <AwardChip
              key={award.id}
              entry={entry}
              award={award}
              awardLabelLookup={awardLabelLookup}
              onRemoveAward={onRemoveAward}
              resolveAwardLabel={resolveAwardLabel}
            />
          ))
        )}
      </div>
      <select
        value=""
        onChange={(event) => {
          if (!event.target.value) {
            return;
          }
          console.info("[show-manage][entry-card][add-award-click]", {
            entryId: entry.id,
            dogName: entry.dogName,
            awardCode: event.target.value,
            awardLabel:
              awardLabelLookup.get(event.target.value.trim()) ??
              event.target.value,
            awardsBefore: getAwardLogEntries(entry.awards),
          });
          onAddAward(entry.id, event.target.value);
        }}
        disabled={awardsDisabled || availableAwardOptions.length === 0}
        className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      >
        <option value="">-</option>
        {availableAwardOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Selected awards appear as badges. Use the `x` to remove one.
      </p>
    </div>
  );
}

function AwardChip({
  entry,
  award,
  awardLabelLookup,
  onRemoveAward,
  resolveAwardLabel,
}: {
  entry: ManageShowEntry;
  award: ManageShowAward;
  awardLabelLookup: OptionLabelLookup;
  onRemoveAward: (entryId: string, awardId: string) => void;
  resolveAwardLabel: (value: string) => string;
}) {
  return (
    <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
      <span>{resolveAwardLabel(award.code)}</span>
      <button
        type="button"
        aria-label={`Remove award ${award.code}`}
        onClick={() => {
          console.info("[show-manage][entry-card][remove-award-click]", {
            entryId: entry.id,
            dogName: entry.dogName,
            awardId: award.id,
            awardCode: award.code,
            awardLabel: resolveAwardLabel(award.code),
            awardsBefore: getAwardLogEntries(entry.awards),
          });
          onRemoveAward(entry.id, award.id);
        }}
        className="hover:bg-muted-foreground/10 rounded-full px-1 leading-none"
      >
        ×
      </button>
    </span>
  );
}
