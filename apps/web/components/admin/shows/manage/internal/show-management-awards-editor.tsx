"use client";

import React from "react";
import type { AdminShowResultOption } from "@beagle/contracts";
import type {
  ManageShowAward,
  ManageShowEntry,
} from "../show-management-types";

type ShowManagementAwardsEditorProps = {
  entry: ManageShowEntry;
  availableAwardOptions: AdminShowResultOption[];
  awardsDisabled: boolean;
  onAddAward: (entryId: string, awardCode: string) => void;
  onRemoveAward: (entryId: string, awardId: string) => void;
  resolveAwardLabel: (value: string) => string;
};

export function ShowManagementAwardsEditor({
  entry,
  availableAwardOptions,
  awardsDisabled,
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
  onRemoveAward,
  resolveAwardLabel,
}: {
  entry: ManageShowEntry;
  award: ManageShowAward;
  onRemoveAward: (entryId: string, awardId: string) => void;
  resolveAwardLabel: (value: string) => string;
}) {
  return (
    <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
      <span>{resolveAwardLabel(award.code)}</span>
      <button
        type="button"
        aria-label={`Remove award ${award.code}`}
        onClick={() => onRemoveAward(entry.id, award.id)}
        className="hover:bg-muted-foreground/10 rounded-full px-1 leading-none"
      >
        ×
      </button>
    </span>
  );
}
