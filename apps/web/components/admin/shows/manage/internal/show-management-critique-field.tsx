"use client";

import React from "react";
import type { ManageShowEntry } from "../show-management-types";

type ShowManagementCritiqueFieldProps = {
  entry: ManageShowEntry;
  isDisabled?: boolean;
  onEntryFieldChange: (
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) => void;
};

export function ShowManagementCritiqueField({
  entry,
  isDisabled = false,
  onEntryFieldChange,
}: ShowManagementCritiqueFieldProps) {
  return (
    <label className="space-y-1 text-sm md:col-span-2">
      <span>Critique</span>
      <textarea
        value={entry.critiqueText}
        disabled={isDisabled}
        onChange={(event) =>
          onEntryFieldChange(entry.id, "critiqueText", event.target.value)
        }
        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      />
    </label>
  );
}
