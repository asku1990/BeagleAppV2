import Link from "next/link";
import type { BeagleDogProfileShowRowDto } from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import {
  formatAwards,
  formatClassResult,
  formatPupn,
  formatQualityGrade,
  formatShowType,
  getBeagleShowHref,
} from "@/lib/public/beagle/shows";
import {
  DOG_PROFILE_SHOW_FALLBACK_VALUE,
  formatDogProfileShowDate,
  formatDogProfileShowHeight,
  type DogProfileShowCritique,
  type DogProfileShowsT,
} from "./dog-profile-shows-core";

type DogProfileShowsResultsMobileProps = {
  visibleRows: BeagleDogProfileShowRowDto[];
  hasShowType: boolean;
  hasQualityGrade: boolean;
  hasClassResult: boolean;
  hasPupn: boolean;
  hasAwards: boolean;
  hasReviewText: boolean;
  hasJudge: boolean;
  hasHeight: boolean;
  locale: "fi" | "sv";
  t: DogProfileShowsT;
  onOpenCritique: (critique: DogProfileShowCritique) => void;
};

export function DogProfileShowsResultsMobile({
  visibleRows,
  hasShowType,
  hasQualityGrade,
  hasClassResult,
  hasPupn,
  hasAwards,
  hasReviewText,
  hasJudge,
  hasHeight,
  locale,
  t,
  onOpenCritique,
}: DogProfileShowsResultsMobileProps) {
  return (
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
              <span>{formatDogProfileShowDate(row.date, locale)}</span>
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
            {hasClassResult && (
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("dog.profile.shows.col.classResult")}:
                </span>{" "}
                <span>{formatClassResult(row)}</span>
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
                <span>{formatDogProfileShowHeight(row.heightCm)}</span>
              </p>
            )}
            {hasJudge && (
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("dog.profile.shows.col.judge")}:
                </span>{" "}
                <span>{row.judge ?? DOG_PROFILE_SHOW_FALLBACK_VALUE}</span>
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
                      onOpenCritique({
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
                  <span>{DOG_PROFILE_SHOW_FALLBACK_VALUE}</span>
                )}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
