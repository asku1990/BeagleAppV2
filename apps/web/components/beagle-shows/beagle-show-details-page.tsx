import { useState } from "react";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
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
  copyShowDetailRowsToClipboard,
  formatIsoDateForDisplay,
} from "@/lib/public/beagle/shows";
import { cn } from "@/lib/utils";
import { BeagleShowDetailsResults } from "./beagle-show-details-results";

export function BeagleShowDetailsPage({
  details,
}: {
  details: BeagleShowDetailsResponse;
}) {
  const { t, locale } = useI18n();
  const reviewOpenLabel = t("shows.details.review.open");
  const reviewModalTitle = t("shows.details.review.modalTitle");
  const [selectedCritique, setSelectedCritique] = useState<{
    registrationNo: string;
    name: string;
    text: string;
  } | null>(null);
  const hasShowType = details.items.some((row) => row.showType != null);
  const hasClassCode = details.items.some((row) => row.classCode != null);
  const hasQualityGrade = details.items.some((row) => row.qualityGrade != null);
  const hasClassPlacement = details.items.some(
    (row) => row.classPlacement != null,
  );
  const hasPupn = details.items.some((row) => row.pupn != null);
  const hasAwards = details.items.some((row) => row.awards.length > 0);
  const hasHeight = details.items.some((row) => row.heightCm != null);
  const hasJudge = details.items.some((row) => row.judge != null);
  const hasReviewText = details.items.some((row) =>
    Boolean(row.critiqueText?.trim()),
  );
  const clipboardLabels = {
    registrationNo: t("shows.details.col.reg"),
    name: t("shows.details.col.name"),
    sex: t("shows.details.col.sex"),
    showType: t("shows.details.col.showType"),
    className: t("shows.details.col.className"),
    qualityGrade: t("shows.details.col.qualityGrade"),
    placement: t("shows.details.col.placement"),
    pupn: t("shows.details.col.pupn"),
    awards: t("shows.details.col.awards"),
    reviewText: t("shows.details.col.reviewText"),
    height: t("shows.details.col.height"),
    judge: t("shows.details.col.judge"),
    sexMale: t("shows.details.sex.male"),
    sexFemale: t("shows.details.sex.female"),
    sexUnknown: t("shows.details.sex.unknown"),
  };
  const clipboardMessages = {
    success: t("shows.details.copy.success"),
    error: t("shows.details.copy.error"),
    unsupported: t("shows.details.copy.unsupported"),
  };

  const handleCopyAllRows = async () => {
    await copyShowDetailRowsToClipboard({
      rows: details.items,
      labels: clipboardLabels,
      columns: {
        includeShowType: hasShowType,
        includeClassName: hasClassCode,
        includeQualityGrade: hasQualityGrade,
        includeClassPlacement: hasClassPlacement,
        includePupn: hasPupn,
        includeAwards: hasAwards,
        includeHeight: hasHeight,
        includeJudge: hasJudge,
        includeReviewText: hasReviewText,
      },
      messages: clipboardMessages,
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  return (
    <>
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}
            >
              {t("shows.details.title")}
            </h1>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {formatIsoDateForDisplay(details.show.eventDate, locale)} •{" "}
              {details.show.eventPlace}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("shows.details.judge")}: {details.show.judge ?? "-"}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("shows.details.dogCount")}: {details.show.dogCount}
            </p>
          </div>
        </div>
      </header>

      <ListingSectionShell
        title={t("shows.details.section.title")}
        count={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {t("shows.details.dogCount")}: {details.items.length}
            </span>
            {details.items.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  void handleCopyAllRows();
                }}
                className={cn("text-xs", beagleTheme.actionLink)}
              >
                {t("shows.details.copy.all")}
              </button>
            ) : null}
          </span>
        }
      >
        <BeagleShowDetailsResults
          details={details}
          reviewOpenLabel={reviewOpenLabel}
          t={t}
          onOpenCritique={setSelectedCritique}
        />
      </ListingSectionShell>
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
            <DialogTitle>{reviewModalTitle}</DialogTitle>
          </DialogHeader>
          {selectedCritique ? (
            <div className="space-y-3 text-sm">
              <p className={beagleTheme.mutedText}>
                {selectedCritique.registrationNo} • {selectedCritique.name}
              </p>
              <p className="whitespace-pre-wrap">{selectedCritique.text}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
