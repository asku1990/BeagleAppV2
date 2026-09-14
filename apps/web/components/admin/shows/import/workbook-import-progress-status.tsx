import { Loader2 } from "lucide-react";
import { formatWorkbookImportElapsedTime } from "@/lib/admin/shows/import/workbook-import-progress";

type WorkbookImportProgressStatusProps = {
  title: string;
  guidance: string;
  elapsedLabel: string;
  elapsedSeconds: number;
  locale?: string;
  counts: {
    events: number;
    entries: number;
    resultItems: number;
  } | null;
  countLabels: {
    events: string;
    entries: string;
    resultItems: string;
  };
};

export function WorkbookImportProgressStatus({
  title,
  guidance,
  elapsedLabel,
  elapsedSeconds,
  locale,
  counts,
  countLabels,
}: WorkbookImportProgressStatusProps) {
  const numberFormatter = new Intl.NumberFormat(locale);

  return (
    <div
      className="rounded-md border bg-muted/40 px-3 py-2 text-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 font-medium">
        <Loader2 className="size-4 animate-spin" />
        <span>{title}</span>
        <span
          className="ml-auto tabular-nums text-muted-foreground"
          aria-hidden="true"
        >
          {elapsedLabel} {formatWorkbookImportElapsedTime(elapsedSeconds)}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{guidance}</p>
      {counts ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {numberFormatter.format(counts.events)} {countLabels.events} ·{" "}
          {numberFormatter.format(counts.entries)} {countLabels.entries} ·{" "}
          {numberFormatter.format(counts.resultItems)} {countLabels.resultItems}
        </p>
      ) : null}
    </div>
  );
}
