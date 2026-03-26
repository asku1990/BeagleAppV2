"use client";

import React from "react";
import type {
  AdminShowWorkbookImportIssue,
  AdminShowWorkbookImportPreviewEntry,
} from "@beagle/contracts";
import { cn } from "@/lib/utils";

export type PreviewTranslationKey =
  | "admin.shows.preview.entry.row"
  | "admin.shows.preview.entry.registration"
  | "admin.shows.preview.entry.name"
  | "admin.shows.preview.entry.matchStatus"
  | "admin.shows.preview.entry.dogMatched"
  | "admin.shows.preview.entry.dogMissing"
  | "admin.shows.preview.entry.status"
  | "admin.shows.preview.entry.statusAccepted"
  | "admin.shows.preview.entry.statusRejected"
  | "admin.shows.preview.entry.class"
  | "admin.shows.preview.entry.quality"
  | "admin.shows.preview.entry.resultItems"
  | "admin.shows.preview.entry.judge"
  | "admin.shows.preview.entry.critique"
  | "admin.shows.preview.entry.notes";

export type PreviewTranslator = (key: PreviewTranslationKey) => string;

export function getPreviewRowIssues(
  issues: AdminShowWorkbookImportIssue[],
  rowNumber: number,
): AdminShowWorkbookImportIssue[] {
  return issues.filter((issue) => issue.rowNumber === rowNumber);
}

export function getPreviewRowStatusClass(
  status: "ACCEPTED" | "REJECTED",
): string {
  if (status === "REJECTED") {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }

  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
}

function getSeverityClass(
  severity: AdminShowWorkbookImportIssue["severity"],
): string {
  if (severity === "ERROR") {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }

  if (severity === "WARNING") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700";
  }

  return "border-sky-500/40 bg-sky-500/10 text-sky-700";
}

export function formatPreviewResultItems(
  entry: AdminShowWorkbookImportPreviewEntry,
): string {
  return entry.resultItems
    .map((item) => {
      if (item.valueCode) {
        return `${item.definitionCode}: ${item.valueCode}`;
      }

      if (item.valueNumeric !== null) {
        return `${item.definitionCode}: ${item.valueNumeric}`;
      }

      return item.definitionCode;
    })
    .join(", ");
}

export function renderPreviewNotes(issues: AdminShowWorkbookImportIssue[]) {
  if (issues.length === 0) {
    return "-";
  }

  return (
    <div className="flex flex-wrap gap-2">
      {issues.map((issue, index) => (
        <span
          key={`${issue.code}-${index}`}
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            getSeverityClass(issue.severity),
          )}
        >
          {issue.message}
        </span>
      ))}
    </div>
  );
}
