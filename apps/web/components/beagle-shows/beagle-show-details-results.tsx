import Link from "next/link";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
import { ListingResponsiveResults } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import {
  formatAwards,
  formatClassResult,
  formatPupn,
  formatQualityGrade,
  formatShowType,
  hasShowClassResult,
} from "@/lib/public/beagle/shows";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import { BeagleShowDetailsResultsMobile } from "./beagle-show-details-results-mobile";

type ShowDetailCritique = {
  registrationNo: string;
  name: string;
  text: string;
};

type BeagleShowDetailsResultsProps = {
  details: BeagleShowDetailsResponse;
  reviewOpenLabel: string;
  onOpenCritique: (critique: ShowDetailCritique) => void;
  t: (
    key:
      | "shows.details.col.reg"
      | "shows.details.col.name"
      | "shows.details.col.sex"
      | "shows.details.col.showType"
      | "shows.details.col.className"
      | "shows.details.col.qualityGrade"
      | "shows.details.col.classResult"
      | "shows.details.col.pupn"
      | "shows.details.col.awards"
      | "shows.details.col.height"
      | "shows.details.col.judge"
      | "shows.details.col.reviewText"
      | "shows.details.sex.male"
      | "shows.details.sex.female"
      | "shows.details.sex.unknown",
  ) => string;
};

function mapSexLabel(
  value: "U" | "N" | "-",
  t: BeagleShowDetailsResultsProps["t"],
): string {
  if (value === "U") return t("shows.details.sex.male");
  if (value === "N") return t("shows.details.sex.female");
  return t("shows.details.sex.unknown");
}

function formatHeight(heightCm: number | null): string {
  if (heightCm == null) {
    return "-";
  }
  return `${heightCm} cm`;
}

function renderDogValue(value: string, dogId: string | null) {
  if (!dogId) {
    return value;
  }

  return (
    <Link href={getDogProfileHref(dogId)} className={beagleTheme.entityLink}>
      {value}
    </Link>
  );
}

export function BeagleShowDetailsResults({
  details,
  reviewOpenLabel,
  onOpenCritique,
  t,
}: BeagleShowDetailsResultsProps) {
  const hasShowType = details.items.some((row) => row.showType != null);
  const hasQualityGrade = details.items.some((row) => row.qualityGrade != null);
  const hasClassResult = hasShowClassResult(details.items);
  const hasPupn = details.items.some((row) => row.pupn != null);
  const hasAwards = details.items.some((row) => row.awards.length > 0);
  const hasHeight = details.items.some((row) => row.heightCm != null);
  const hasJudge = details.items.some((row) => row.judge != null);
  const hasReviewText = details.items.some((row) =>
    Boolean(row.critiqueText?.trim()),
  );

  return (
    <ListingResponsiveResults
      desktop={
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse text-sm">
            <thead>
              <tr className={cn("border-b text-left", beagleTheme.border)}>
                <th className="px-2 py-2 font-semibold">
                  {t("shows.details.col.reg")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("shows.details.col.name")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("shows.details.col.sex")}
                </th>
                {hasShowType ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.showType")}
                  </th>
                ) : null}
                {hasQualityGrade ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.qualityGrade")}
                  </th>
                ) : null}
                {hasClassResult ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.classResult")}
                  </th>
                ) : null}
                {hasPupn ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.pupn")}
                  </th>
                ) : null}
                {hasAwards ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.awards")}
                  </th>
                ) : null}
                {hasHeight ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.height")}
                  </th>
                ) : null}
                {hasJudge ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.judge")}
                  </th>
                ) : null}
                {hasReviewText ? (
                  <th className="px-2 py-2 font-semibold">
                    {t("shows.details.col.reviewText")}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {details.items.map((row) => {
                const critique = row.critiqueText?.trim();

                return (
                  <tr
                    key={row.id}
                    className={cn("border-b align-top", beagleTheme.border)}
                  >
                    <td className="px-2 py-2">
                      {renderDogValue(row.registrationNo, row.dogId)}
                    </td>
                    <td className="px-2 py-2">
                      {renderDogValue(row.name, row.dogId)}
                    </td>
                    <td className="px-2 py-2">{mapSexLabel(row.sex, t)}</td>
                    {hasShowType ? (
                      <td className="px-2 py-2">{formatShowType(row)}</td>
                    ) : null}
                    {hasQualityGrade ? (
                      <td className="px-2 py-2">{formatQualityGrade(row)}</td>
                    ) : null}
                    {hasClassResult ? (
                      <td className="px-2 py-2">{formatClassResult(row)}</td>
                    ) : null}
                    {hasPupn ? (
                      <td className="px-2 py-2">{formatPupn(row)}</td>
                    ) : null}
                    {hasAwards ? (
                      <td className="px-2 py-2">{formatAwards(row)}</td>
                    ) : null}
                    {hasHeight ? (
                      <td className="px-2 py-2">
                        {formatHeight(row.heightCm)}
                      </td>
                    ) : null}
                    {hasJudge ? (
                      <td className="px-2 py-2">{row.judge ?? "-"}</td>
                    ) : null}
                    {hasReviewText ? (
                      <td className="px-2 py-2">
                        {critique ? (
                          <button
                            type="button"
                            className={beagleTheme.actionLinkStrong}
                            onClick={() =>
                              onOpenCritique({
                                registrationNo: row.registrationNo,
                                name: row.name,
                                text: critique,
                              })
                            }
                          >
                            {reviewOpenLabel}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }
      mobile={
        <BeagleShowDetailsResultsMobile
          details={details}
          reviewOpenLabel={reviewOpenLabel}
          onOpenCritique={onOpenCritique}
          t={t}
        />
      }
    />
  );
}
