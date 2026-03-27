"use client";

import React from "react";
import { useState } from "react";
import type { AdminShowWorkbookImportPreviewResponse } from "@beagle/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { ShowWorkbookPreviewResults } from "./show-workbook-preview-results";

type ShowWorkbookPreviewSectionProps = {
  preview: AdminShowWorkbookImportPreviewResponse;
  acceptedNotesSummary?: {
    warningCount: number;
    ignoredColumnCount: number;
  } | null;
  onShowNotes?: () => void;
};

type PreviewTranslationKey =
  | MessageKey
  | "admin.shows.preview.filters.label"
  | "admin.shows.preview.filters.all"
  | "admin.shows.preview.filters.warnings"
  | "admin.shows.preview.filters.empty"
  | "admin.shows.preview.summary.events"
  | "admin.shows.preview.summary.entries"
  | "admin.shows.preview.summary.resultItems"
  | "admin.shows.preview.events.entriesSuffix"
  | "admin.shows.preview.events.title";

type PreviewTranslator = (key: PreviewTranslationKey) => string;
type PreviewRowFilter = "all" | "warnings";

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export function ShowWorkbookPreviewSection({
  preview,
  acceptedNotesSummary = null,
  onShowNotes,
}: ShowWorkbookPreviewSectionProps) {
  const { t, locale } = useI18n();
  const translate: PreviewTranslator = t;
  const formatter = new Intl.NumberFormat(locale);
  const [rowFilter, setRowFilter] = useState<PreviewRowFilter>("all");

  const warningRowCount = preview.events.reduce((count, event) => {
    return (
      count +
      event.entries.filter((entry) =>
        preview.issues.some(
          (issue) =>
            issue.rowNumber === entry.rowNumber && issue.severity === "WARNING",
        ),
      ).length
    );
  }, 0);

  const visibleEvents =
    rowFilter === "all"
      ? preview.events
      : preview.events
          .map((event) => ({
            ...event,
            entries: event.entries.filter((entry) =>
              preview.issues.some(
                (issue) =>
                  issue.rowNumber === entry.rowNumber &&
                  issue.severity === "WARNING",
              ),
            ),
          }))
          .filter((event) => event.entries.length > 0);

  return (
    <div className="space-y-4">
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}
            >
              {t("admin.shows.preview.title")}
            </h2>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("admin.shows.preview.description")}
            </p>
          </div>
        </div>
      </header>

      {acceptedNotesSummary ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-amber-900">
              {t("admin.shows.preview.notesAccepted.title")}
            </p>
            <p className="text-xs text-amber-800">
              {formatter.format(acceptedNotesSummary.warningCount)}{" "}
              {t("admin.shows.preview.notesAccepted.warnings")} ·{" "}
              {formatter.format(acceptedNotesSummary.ignoredColumnCount)}{" "}
              {t("admin.shows.preview.notesAccepted.ignored")}
            </p>
          </div>
          {onShowNotes ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onShowNotes}
            >
              {t("admin.shows.preview.notesAccepted.showNotes")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {warningRowCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {t("admin.shows.preview.filters.label")}
            </p>
            <p className="text-xs text-muted-foreground">
              {warningRowCount}{" "}
              {t("admin.shows.validation.notes.countSuffixWarnings")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={rowFilter === "all" ? "secondary" : "outline"}
              size="sm"
              aria-pressed={rowFilter === "all"}
              onClick={() => setRowFilter("all")}
            >
              {t("admin.shows.preview.filters.all")}
            </Button>
            <Button
              type="button"
              variant={rowFilter === "warnings" ? "secondary" : "outline"}
              size="sm"
              aria-pressed={rowFilter === "warnings"}
              onClick={() => setRowFilter("warnings")}
            >
              {t("admin.shows.preview.filters.warnings")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <PreviewStat
          label={t("admin.shows.preview.summary.events")}
          value={formatter.format(preview.eventCount)}
        />
        <PreviewStat
          label={t("admin.shows.preview.summary.entries")}
          value={formatter.format(preview.entryCount)}
        />
        <PreviewStat
          label={t("admin.shows.preview.summary.resultItems")}
          value={formatter.format(preview.resultItemCount)}
        />
      </div>

      {visibleEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {t("admin.shows.preview.filters.empty")}
        </div>
      ) : null}

      {visibleEvents.map((event) => (
        <Card
          key={event.eventLookupKey}
          className={cn(beagleTheme.panel, "gap-0 py-0")}
        >
          <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
            <CardTitle
              className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
            >
              {event.groupLabel}
            </CardTitle>
            {event.eventDateIso || event.eventType ? (
              <p className={cn("text-sm", beagleTheme.mutedText)}>
                {[event.eventDateIso, event.eventType]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            ) : null}
            <p className={cn("text-sm", beagleTheme.mutedText)}>
              {t("admin.shows.preview.events.entriesSuffix")}:{" "}
              {event.entries.length}
            </p>
          </CardHeader>

          <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
            <ShowWorkbookPreviewResults
              event={event}
              issues={preview.issues}
              t={translate}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
