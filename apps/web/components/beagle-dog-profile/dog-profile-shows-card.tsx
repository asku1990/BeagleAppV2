import Link from "next/link";
import { useState } from "react";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import { parseLocalIsoDate } from "@/lib/public/beagle/dogs/profile";
import {
  copyDogProfileShowRowsToClipboard,
  formatAwards,
  formatClassCode,
  formatClassPlacement,
  formatPupn,
  formatQualityGrade,
  formatShowType,
  hasDogProfileShowClass,
  getBeagleShowHref,
  hasDogProfileShowAwards,
  hasDogProfileShowCritique,
  hasDogProfileShowPlacement,
  hasDogProfileShowPupn,
  hasDogProfileShowQuality,
  hasDogProfileShowType,
} from "@/lib/public/beagle/shows";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileShowRowDto } from "@beagle/contracts";

const FALLBACK_VALUE = "-";

function formatDate(value: string, locale: "fi" | "sv"): string {
  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return FALLBACK_VALUE;
  }

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  return new Intl.DateTimeFormat(localeTag).format(parsed);
}

function formatHeight(heightCm: number | null): string {
  if (heightCm == null) {
    return FALLBACK_VALUE;
  }

  return `${heightCm} cm`;
}

export function DogProfileShowsCard({
  rows,
}: {
  rows: BeagleDogProfileShowRowDto[];
}) {
  const { t, locale } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCritique, setSelectedCritique] = useState<{
    showId: string;
    place: string;
    date: string;
    text: string;
  } | null>(null);
  const canReveal = rows.length > 10;
  const visibleRows = isExpanded ? rows : rows.slice(0, 10);

  const hasShowType = hasDogProfileShowType(rows);
  const hasQualityGrade = hasDogProfileShowQuality(rows);
  const hasClassCode = hasDogProfileShowClass(rows);
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
        <ListingResponsiveResults
          desktop={
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-sm">
                <thead>
                  <tr className={cn("border-b text-left", beagleTheme.border)}>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.no")}
                    </th>
                    {hasShowType && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.showType")}
                      </th>
                    )}
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.place")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.date")}
                    </th>
                    {hasQualityGrade && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.qualityGrade")}
                      </th>
                    )}
                    {hasClassCode && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.className")}
                      </th>
                    )}
                    {hasClassPlacement && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.placement")}
                      </th>
                    )}
                    {hasPupn && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.pupn")}
                      </th>
                    )}
                    {hasAwards && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.awards")}
                      </th>
                    )}
                    {hasHeight && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.height")}
                      </th>
                    )}
                    {hasJudge && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.judge")}
                      </th>
                    )}
                    {hasReviewText && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.reviewText")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn("border-b align-top", beagleTheme.border)}
                    >
                      <td className="px-2 py-2">{index + 1}</td>
                      {hasShowType && (
                        <td className="px-2 py-2">{formatShowType(row)}</td>
                      )}
                      <td className="px-2 py-2">
                        <Link
                          href={getBeagleShowHref(row.showId)}
                          className={beagleTheme.entityLink}
                        >
                          {row.place}
                        </Link>
                      </td>
                      <td className="px-2 py-2">
                        {formatDate(row.date, locale)}
                      </td>
                      {hasQualityGrade && (
                        <td className="px-2 py-2">{formatQualityGrade(row)}</td>
                      )}
                      {hasClassCode && (
                        <td className="px-2 py-2">{formatClassCode(row)}</td>
                      )}
                      {hasClassPlacement && (
                        <td className="px-2 py-2">
                          {formatClassPlacement(row)}
                        </td>
                      )}
                      {hasPupn && (
                        <td className="px-2 py-2">{formatPupn(row)}</td>
                      )}
                      {hasAwards && (
                        <td className="px-2 py-2">{formatAwards(row)}</td>
                      )}
                      {hasHeight && (
                        <td className="px-2 py-2">
                          {formatHeight(row.heightCm)}
                        </td>
                      )}
                      {hasJudge && (
                        <td className="px-2 py-2">
                          {row.judge ?? FALLBACK_VALUE}
                        </td>
                      )}
                      {hasReviewText && (
                        <td className="px-2 py-2">
                          {row.critiqueText?.trim() ? (
                            <button
                              type="button"
                              className={beagleTheme.actionLinkStrong}
                              onClick={() =>
                                setSelectedCritique({
                                  showId: row.showId,
                                  place: row.place,
                                  date: row.date,
                                  text: row.critiqueText?.trim() ?? "",
                                })
                              }
                            >
                              {t("dog.profile.shows.review.open")}
                            </button>
                          ) : (
                            FALLBACK_VALUE
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          mobile={
            <div className="space-y-2">
              {visibleRows.map((row, index) => (
                <article
                  key={row.id}
                  className={cn(
                    "rounded-lg border p-3",
                    beagleTheme.border,
                    beagleTheme.surface,
                  )}
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.no")}:
                      </span>{" "}
                      <span>{index + 1}</span>
                    </p>
                    {hasShowType && (
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.showType")}:
                        </span>{" "}
                        <span>{formatShowType(row)}</span>
                      </p>
                    )}
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.date")}:
                      </span>{" "}
                      <span>{formatDate(row.date, locale)}</span>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.place")}:
                      </span>{" "}
                      <Link
                        href={getBeagleShowHref(row.showId)}
                        className={beagleTheme.entityLink}
                      >
                        {row.place}
                      </Link>
                    </p>
                    {hasQualityGrade && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.qualityGrade")}:
                        </span>{" "}
                        <span>{formatQualityGrade(row)}</span>
                      </p>
                    )}
                    {hasClassCode && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.className")}:
                        </span>{" "}
                        <span>{formatClassCode(row)}</span>
                      </p>
                    )}
                    {hasClassPlacement && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.placement")}:
                        </span>{" "}
                        <span>{formatClassPlacement(row)}</span>
                      </p>
                    )}
                    {hasPupn && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.pupn")}:
                        </span>{" "}
                        <span>{formatPupn(row)}</span>
                      </p>
                    )}
                    {hasAwards && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.awards")}:
                        </span>{" "}
                        <span>{formatAwards(row)}</span>
                      </p>
                    )}
                    {hasHeight && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.height")}:
                        </span>{" "}
                        <span>{formatHeight(row.heightCm)}</span>
                      </p>
                    )}
                    {hasJudge && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.judge")}:
                        </span>{" "}
                        <span>{row.judge ?? FALLBACK_VALUE}</span>
                      </p>
                    )}
                    {hasReviewText && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.reviewText")}:
                        </span>{" "}
                        {row.critiqueText?.trim() ? (
                          <button
                            type="button"
                            className={beagleTheme.actionLinkStrong}
                            onClick={() =>
                              setSelectedCritique({
                                showId: row.showId,
                                place: row.place,
                                date: row.date,
                                text: row.critiqueText?.trim() ?? "",
                              })
                            }
                          >
                            {t("dog.profile.shows.review.open")}
                          </button>
                        ) : (
                          <span>{FALLBACK_VALUE}</span>
                        )}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          }
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
                {formatDate(selectedCritique.date, locale)}
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
