"use client";

import { AdminRowActionsMenu } from "@/components/admin";
import { ListingResponsiveResults } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import type { ManageShowEntry } from "../show-management-types";

type EntryDisplayState = {
  classResultText: string;
  qualityText: string;
  pupnText: string;
  awardsText: string;
};

function formatHeight(heightCm: string): string {
  const normalized = heightCm.trim();
  if (!normalized) {
    return "-";
  }
  return `${normalized} cm`;
}

function formatText(value: string): string {
  const normalized = value.trim();
  return normalized || "-";
}

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
  const { t } = useI18n();
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
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.reg")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.name")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.classResult")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.quality")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.pupn")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.awards")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.height")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.judge")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.reviewText")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.entryResults.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b align-top">
                <td className="px-2 py-2">{entry.registrationNo}</td>
                <td className="px-2 py-2">
                  <p className="font-medium">{entry.dogName}</p>
                  <p
                    className={
                      entry.dogId
                        ? "text-xs text-muted-foreground"
                        : "text-xs text-amber-700"
                    }
                  >
                    {entry.dogId
                      ? t("admin.shows.manage.entryModal.linked")
                      : t("admin.shows.manage.entryModal.snapshot")}
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
                <td className="px-2 py-2">{formatHeight(entry.heightCm)}</td>
                <td className="px-2 py-2">{formatText(entry.judge)}</td>
                <td className="px-2 py-2">{formatText(entry.critiqueText)}</td>
                <td className="px-2 py-2">
                  <AdminRowActionsMenu
                    triggerAriaLabel={`${t("admin.shows.manage.entryResults.actionsAriaPrefix")} ${entry.dogName}`}
                    actions={[
                      {
                        id: "edit",
                        label: t("admin.shows.manage.entryResults.editEntry"),
                        onSelect: () => onEditEntry(entry.id),
                        disabled: areActionsDisabled,
                      },
                      {
                        id: "remove",
                        label: t("admin.shows.manage.entryResults.removeDog"),
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
                  ? t("admin.shows.manage.entryModal.linked")
                  : t("admin.shows.manage.entryModal.snapshot")}
              </p>
            </div>
            <div className="text-sm space-y-1">
              <p>
                {t("admin.shows.manage.entryResults.reg")}:{" "}
                {entry.registrationNo}
              </p>
              <p>
                {t("admin.shows.manage.entryResults.classResult")}:{" "}
                {entryDisplayStates[entry.id]?.classResultText ?? "-"}
              </p>
              <p>
                {t("admin.shows.manage.entryResults.quality")}:{" "}
                {entryDisplayStates[entry.id]?.qualityText ?? "-"}
              </p>
              <p>
                {t("admin.shows.manage.entryResults.pupn")}:{" "}
                {entryDisplayStates[entry.id]?.pupnText ?? "-"}
              </p>
              <p>
                {t("admin.shows.manage.entryResults.awards")}:{" "}
                {entryDisplayStates[entry.id]?.awardsText ?? "-"}
              </p>
              <p>
                {t("admin.shows.manage.entryResults.height")}:{" "}
                {formatHeight(entry.heightCm)}
              </p>
              <p>
                {t("admin.shows.manage.entryResults.judge")}:{" "}
                {formatText(entry.judge)}
              </p>
              <p>
                {t("admin.shows.manage.entryResults.reviewText")}:{" "}
                {formatText(entry.critiqueText)}
              </p>
            </div>
            <AdminRowActionsMenu
              triggerAriaLabel={`${t("admin.shows.manage.entryResults.actionsAriaPrefix")} ${entry.dogName}`}
              actions={[
                {
                  id: "edit",
                  label: t("admin.shows.manage.entryResults.editEntry"),
                  onSelect: () => onEditEntry(entry.id),
                  disabled: areActionsDisabled,
                },
                {
                  id: "remove",
                  label: t("admin.shows.manage.entryResults.removeDog"),
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
