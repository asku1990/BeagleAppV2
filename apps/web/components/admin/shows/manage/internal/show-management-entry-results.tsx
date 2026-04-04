"use client";

import { AdminRowActionsMenu } from "@/components/admin";
import { ListingResponsiveResults } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import type { ManageShowEntry } from "../show-management-types";

type EntryDisplayState = {
  classResultText: string;
  qualityText: string;
  pupnText: string;
  awardsText: string;
};

export function ShowManagementEntryResults({
  entries,
  entryDisplayStates,
  isApplyingEvent,
  isRemovingEntry,
  applyingEntryId,
  onEditEntry,
  onRemoveEntry,
}: {
  entries: ManageShowEntry[];
  entryDisplayStates: Record<string, EntryDisplayState>;
  isApplyingEvent: boolean;
  isRemovingEntry: boolean;
  applyingEntryId: string | null;
  onEditEntry: (entryId: string) => void;
  onRemoveEntry: (entry: ManageShowEntry) => void;
}) {
  const areActionsDisabled =
    isApplyingEvent || isRemovingEntry || Boolean(applyingEntryId);

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">Dog</th>
              <th className="px-2 py-2">Class</th>
              <th className="px-2 py-2">Quality</th>
              <th className="px-2 py-2">PUPN</th>
              <th className="px-2 py-2">Awards</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b align-top">
                <td className="px-2 py-2">
                  <p className="font-medium">{entry.dogName}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.registrationNo}
                  </p>
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
                </td>
                <td className="px-2 py-2">
                  {entryDisplayStates[entry.id]?.classResultText ?? "-"}
                </td>
                <td className="px-2 py-2">
                  {entryDisplayStates[entry.id]?.qualityText ?? "-"}
                </td>
                <td className="px-2 py-2">
                  {entryDisplayStates[entry.id]?.pupnText ?? "-"}
                </td>
                <td className="px-2 py-2">
                  {entryDisplayStates[entry.id]?.awardsText ?? "-"}
                </td>
                <td className="px-2 py-2">
                  <AdminRowActionsMenu
                    triggerAriaLabel={`Actions for ${entry.dogName}`}
                    actions={[
                      {
                        id: "edit",
                        label: "Edit entry",
                        onSelect: () => onEditEntry(entry.id),
                        disabled: areActionsDisabled,
                      },
                      {
                        id: "remove",
                        label: "Remove dog",
                        onSelect: () => onRemoveEntry(entry),
                        disabled: areActionsDisabled,
                        destructive: true,
                        separatorBefore: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      mobile={entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="space-y-3 pt-4">
            <div>
              <p className="font-medium">{entry.dogName}</p>
              <p className="text-sm text-muted-foreground">
                {entry.registrationNo}
              </p>
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
            </div>
            <div className="text-sm space-y-1">
              <p>
                Class: {entryDisplayStates[entry.id]?.classResultText ?? "-"}
              </p>
              <p>Quality: {entryDisplayStates[entry.id]?.qualityText ?? "-"}</p>
              <p>PUPN: {entryDisplayStates[entry.id]?.pupnText ?? "-"}</p>
              <p>Awards: {entryDisplayStates[entry.id]?.awardsText ?? "-"}</p>
            </div>
            <AdminRowActionsMenu
              triggerAriaLabel={`Actions for ${entry.dogName}`}
              actions={[
                {
                  id: "edit",
                  label: "Edit entry",
                  onSelect: () => onEditEntry(entry.id),
                  disabled: areActionsDisabled,
                },
                {
                  id: "remove",
                  label: "Remove dog",
                  onSelect: () => onRemoveEntry(entry),
                  disabled: areActionsDisabled,
                  destructive: true,
                  separatorBefore: true,
                },
              ]}
            />
          </CardContent>
        </Card>
      ))}
    />
  );
}
