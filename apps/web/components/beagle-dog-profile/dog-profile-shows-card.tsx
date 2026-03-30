import { useState } from "react";
import type { BeagleDogProfileShowRowDto } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import {
  copyDogProfileShowRowsToClipboard,
  hasDogProfileShowAwards,
  hasDogProfileShowClass,
  hasDogProfileShowCritique,
  hasDogProfileShowPlacement,
  hasDogProfileShowPupn,
  hasDogProfileShowQuality,
  hasDogProfileShowType,
  hasShowClassResult,
} from "@/lib/public/beagle/shows";
import { cn } from "@/lib/utils";
import { DogProfileShowsResults } from "./dog-profile-shows-results";
import {
  formatDogProfileShowDate,
  type DogProfileShowCritique,
} from "./dog-profile-shows-core";

export function DogProfileShowsCard({
  rows,
}: {
  rows: BeagleDogProfileShowRowDto[];
}) {
  const { t, locale } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCritique, setSelectedCritique] =
    useState<DogProfileShowCritique | null>(null);
  const canReveal = rows.length > 10;
  const visibleRows = isExpanded ? rows : rows.slice(0, 10);

  const hasShowType = hasDogProfileShowType(rows);
  const hasQualityGrade = hasDogProfileShowQuality(rows);
  const hasClassCode = hasDogProfileShowClass(rows);
  const hasClassResult = hasShowClassResult(rows);
  const hasClassPlacement = hasDogProfileShowPlacement(rows);
  const hasPupn = hasDogProfileShowPupn(rows);
  const hasAwards = hasDogProfileShowAwards(rows);
  const hasReviewText = hasDogProfileShowCritique(rows);
  const hasJudge = rows.some((r) => r.judge != null);
  const hasHeight = rows.some((r) => r.heightCm != null);

  const handleCopyRows = async () => {
    await copyDogProfileShowRowsToClipboard({
      rows,
      labels: {
        no: t("dog.profile.shows.col.no"),
        showType: t("dog.profile.shows.col.showType"),
        className: t("dog.profile.shows.col.className"),
        place: t("dog.profile.shows.col.place"),
        date: t("dog.profile.shows.col.date"),
        qualityGrade: t("dog.profile.shows.col.qualityGrade"),
        placement: t("dog.profile.shows.col.placement"),
        pupn: t("dog.profile.shows.col.pupn"),
        awards: t("dog.profile.shows.col.awards"),
        reviewText: t("dog.profile.shows.col.reviewText"),
        height: t("dog.profile.shows.col.height"),
        judge: t("dog.profile.shows.col.judge"),
      },
      columns: {
        includeShowType: hasShowType,
        includeQualityGrade: hasQualityGrade,
        includeClassName: hasClassCode,
        includeClassPlacement: hasClassPlacement,
        includePupn: hasPupn,
        includeAwards: hasAwards,
        includeReviewText: hasReviewText,
        includeHeight: hasHeight,
        includeJudge: hasJudge,
      },
      messages: {
        success: t("dog.profile.shows.copy.success"),
        error: t("dog.profile.shows.copy.error"),
        unsupported: t("dog.profile.shows.copy.unsupported"),
      },
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  return (
    <ListingSectionShell
      title={t("dog.profile.card.shows.title")}
      count={
        <span className="flex flex-wrap items-center gap-2">
          <span>
            {t("dog.profile.count.entries")}: {rows.length}
          </span>
          {rows.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                void handleCopyRows();
              }}
              className={cn("text-xs", beagleTheme.actionLink)}
            >
              {t("dog.profile.shows.copy.button")}
            </button>
          ) : null}
        </span>
      }
    >
      {rows.length === 0 ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-8 text-center text-sm",
            beagleTheme.border,
            beagleTheme.mutedText,
          )}
        >
          {t("dog.profile.empty.shows")}
        </div>
      ) : (
        <DogProfileShowsResults
          visibleRows={visibleRows}
          hasShowType={hasShowType}
          hasQualityGrade={hasQualityGrade}
          hasClassResult={hasClassResult}
          hasPupn={hasPupn}
          hasAwards={hasAwards}
          hasReviewText={hasReviewText}
          hasJudge={hasJudge}
          hasHeight={hasHeight}
          locale={locale}
          t={t}
          onOpenCritique={setSelectedCritique}
        />
      )}
      <Dialog
        open={Boolean(selectedCritique)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCritique(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {t("dog.profile.shows.review.modalTitle")}
            </DialogTitle>
          </DialogHeader>
          {selectedCritique ? (
            <div className="space-y-3 text-sm">
              <p className={beagleTheme.mutedText}>
                {selectedCritique.place} •{" "}
                {formatDogProfileShowDate(selectedCritique.date, locale)}
              </p>
              <p className="whitespace-pre-wrap">{selectedCritique.text}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      {canReveal ? (
        <div className="flex items-center justify-between gap-3 pt-3">
          <p className={cn("text-xs", beagleTheme.mutedText)}>
            {t("dog.profile.section.showing")} {visibleRows.length} /{" "}
            {rows.length}
          </p>
          <button
            type="button"
            className={cn(
              "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium",
              beagleTheme.border,
              beagleTheme.surface,
              beagleTheme.inkStrongText,
              beagleTheme.interactive,
            )}
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded
              ? t("dog.profile.section.showLess")
              : t("dog.profile.section.showMore")}
          </button>
        </div>
      ) : null}
    </ListingSectionShell>
  );
}
