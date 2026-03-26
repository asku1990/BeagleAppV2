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

type ShowWorkbookPreviewResultsMobileProps = {
  event: AdminShowWorkbookImportPreviewEvent;
  issues: AdminShowWorkbookImportIssue[];
  t: PreviewTranslator;
};

export function ShowWorkbookPreviewResultsMobile({
  event,
  issues,
  t,
}: ShowWorkbookPreviewResultsMobileProps) {
  return (
    <div className="space-y-2">
      {event.entries.map((entry) => {
        const rowIssues = getPreviewRowIssues(issues, entry.rowNumber);

        return (
          <article
            key={`${event.eventLookupKey}-${entry.rowNumber}`}
            className={cn(
              "rounded-lg border p-3",
              beagleTheme.border,
              beagleTheme.surface,
            )}
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p>
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.row")}:
                </span>{" "}
                {entry.rowNumber}
              </p>
              <p>
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.registration")}:
                </span>{" "}
                {entry.registrationNo}
              </p>
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.name")}:
                </span>{" "}
                {entry.dogName}
              </p>
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.matchStatus")}:
                </span>{" "}
                {entry.dogMatched
                  ? t("admin.shows.preview.entry.dogMatched")
                  : t("admin.shows.preview.entry.dogMissing")}
              </p>
              <p>
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.class")}:
                </span>{" "}
                {entry.classValue}
              </p>
              <p>
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.quality")}:
                </span>{" "}
                {entry.qualityValue}
              </p>
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.resultItems")}:
                </span>{" "}
                {formatPreviewResultItems(entry) || "-"}
              </p>
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.judge")}:
                </span>{" "}
                {entry.judge ?? "-"}
              </p>
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.critique")}:
                </span>{" "}
                <span className="whitespace-pre-wrap break-words">
                  {entry.critiqueText ?? "-"}
                </span>
              </p>
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.status")}:
                </span>{" "}
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPreviewRowStatusClass(entry.status)}`}
                >
                  {entry.status === "ACCEPTED"
                    ? t("admin.shows.preview.entry.statusAccepted")
                    : t("admin.shows.preview.entry.statusRejected")}
                </span>
              </p>
              <div className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("admin.shows.preview.entry.notes")}:
                </span>{" "}
                {renderPreviewNotes(rowIssues)}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
