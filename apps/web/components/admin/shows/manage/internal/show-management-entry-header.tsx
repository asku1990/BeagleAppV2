"use client";

import React from "react";
import { Button } from "@web/components/ui/button";
import type { ManageShowEntry } from "../show-management-types";

type ShowManagementEntryHeaderProps = {
  entry: ManageShowEntry;
  onRemove: (entry: ManageShowEntry) => void;
  isRemoveDisabled?: boolean;
};

export function ShowManagementEntryHeader({
  entry,
  onRemove,
  isRemoveDisabled = false,
}: ShowManagementEntryHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium">{entry.dogName}</p>
        <p className="text-sm text-muted-foreground">{entry.registrationNo}</p>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => onRemove(entry)}
        disabled={isRemoveDisabled}
      >
        Remove dog
      </Button>
    </div>
  );
}
