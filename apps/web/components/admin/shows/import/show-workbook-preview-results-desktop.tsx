"use client";

import React from "react";
import type {
  AdminShowWorkbookImportIssue,
  AdminShowWorkbookImportPreviewEvent,
} from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import {
  formatPreviewResultItems,
  getPreviewRowIssues,
  getPreviewRowStatusClass,
  renderPreviewNotes,
  type PreviewTranslator,
} from "./show-workbook-preview-results-internal";

type ShowWorkbookPreviewResultsDesktopProps = {
  event: AdminShowWorkbookImportPreviewEvent;
  issues: AdminShowWorkbookImportIssue[];
  t: PreviewTranslator;
};

export function ShowWorkbookPreviewResultsDesktop({
  event,
  issues,
  t,
}: ShowWorkbookPreviewResultsDesktopProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.row")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.registration")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.name")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.class")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.quality")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.resultItems")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.judge")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.critique")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.status")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("admin.shows.preview.entry.notes")}
            </th>
          </tr>
        </thead>
        <tbody>
          {event.entries.map((entry) => {
            const rowIssues = getPreviewRowIssues(issues, entry.rowNumber);

            return (
              <tr
                key={`${event.eventLookupKey}-${entry.rowNumber}`}
                className={cn("border-b align-top", beagleTheme.border)}
              >
                <td className="px-2 py-2">{entry.rowNumber}</td>
                <td className="px-2 py-2">{entry.registrationNo}</td>
                <td className="px-2 py-2">
                  <div className="space-y-1">
                    <div>{entry.dogName}</div>
                    <div className={cn("text-xs", beagleTheme.mutedText)}>
                      {entry.dogMatched
                        ? t("admin.shows.preview.entry.dogMatched")
                        : t("admin.shows.preview.entry.dogMissing")}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2">{entry.classValue}</td>
                <td className="px-2 py-2">{entry.qualityValue}</td>
                <td className="px-2 py-2">
                  {formatPreviewResultItems(entry) || "-"}
                </td>
                <td className="px-2 py-2">{entry.judge ?? "-"}</td>
                <td className="px-2 py-2">
                  <div className="max-w-[32rem] whitespace-pre-wrap break-words">
                    {entry.critiqueText ?? "-"}
                  </div>
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getPreviewRowStatusClass(entry.status)}`}
                  >
                    {entry.status === "ACCEPTED"
                      ? t("admin.shows.preview.entry.statusAccepted")
                      : t("admin.shows.preview.entry.statusRejected")}
                  </span>
                </td>
                <td className="px-2 py-2">{renderPreviewNotes(rowIssues)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
