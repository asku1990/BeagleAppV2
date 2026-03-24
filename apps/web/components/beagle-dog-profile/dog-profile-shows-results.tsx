import Link from "next/link";
import type { BeagleDogProfileShowRowDto } from "@beagle/contracts";
import { ListingResponsiveResults } from "@/components/listing";
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
import { DogProfileShowsResultsMobile } from "./dog-profile-shows-results-mobile";

type DogProfileShowsResultsProps = {
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

export function DogProfileShowsResults({
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
}: DogProfileShowsResultsProps) {
  return (
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
                {hasClassResult && (
                  <th className="px-2 py-2 font-semibold">
                    {t("dog.profile.shows.col.classResult")}
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
                    {formatDogProfileShowDate(row.date, locale)}
                  </td>
                  {hasQualityGrade && (
                    <td className="px-2 py-2">{formatQualityGrade(row)}</td>
                  )}
                  {hasClassResult && (
                    <td className="px-2 py-2">{formatClassResult(row)}</td>
                  )}
                  {hasPupn && <td className="px-2 py-2">{formatPupn(row)}</td>}
                  {hasAwards && (
                    <td className="px-2 py-2">{formatAwards(row)}</td>
                  )}
                  {hasHeight && (
                    <td className="px-2 py-2">
                      {formatDogProfileShowHeight(row.heightCm)}
                    </td>
                  )}
                  {hasJudge && (
                    <td className="px-2 py-2">
                      {row.judge ?? DOG_PROFILE_SHOW_FALLBACK_VALUE}
                    </td>
                  )}
                  {hasReviewText && (
                    <td className="px-2 py-2">
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
                        DOG_PROFILE_SHOW_FALLBACK_VALUE
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
        <DogProfileShowsResultsMobile
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
          onOpenCritique={onOpenCritique}
        />
      }
    />
  );
}
