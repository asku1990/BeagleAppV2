import Link from "next/link";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
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

type ShowDetailCritique = {
  registrationNo: string;
  name: string;
  text: string;
};

type BeagleShowDetailsResultsMobileProps = {
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
  t: BeagleShowDetailsResultsMobileProps["t"],
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

export function BeagleShowDetailsResultsMobile({
  details,
  reviewOpenLabel,
  onOpenCritique,
  t,
}: BeagleShowDetailsResultsMobileProps) {
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
    <div className="space-y-2">
      {details.items.map((row) => {
        const critique = row.critiqueText?.trim();

        return (
          <article
            key={row.id}
            className={cn(
              "rounded-lg border p-3",
              beagleTheme.border,
              beagleTheme.surface,
            )}
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("shows.details.col.reg")}:
                </span>
                {renderDogValue(row.registrationNo, row.dogId)}
              </p>
              <p className="col-span-2">
                <span className={beagleTheme.mutedText}>
                  {t("shows.details.col.name")}:
                </span>
                {renderDogValue(row.name, row.dogId)}
              </p>
              <p>
                <span className={beagleTheme.mutedText}>
                  {t("shows.details.col.sex")}:
                </span>
                <span>{mapSexLabel(row.sex, t)}</span>
              </p>
              {hasShowType ? (
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.showType")}:
                  </span>
                  <span>{formatShowType(row)}</span>
                </p>
              ) : null}
              {hasQualityGrade ? (
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.qualityGrade")}:
                  </span>
                  <span>{formatQualityGrade(row)}</span>
                </p>
              ) : null}
              {hasClassResult ? (
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.classResult")}:
                  </span>
                  <span>{formatClassResult(row)}</span>
                </p>
              ) : null}
              {hasPupn ? (
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.pupn")}:
                  </span>
                  <span>{formatPupn(row)}</span>
                </p>
              ) : null}
              {hasAwards ? (
                <p className="col-span-2">
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.awards")}:
                  </span>
                  <span>{formatAwards(row)}</span>
                </p>
              ) : null}
              {hasHeight ? (
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.height")}:
                  </span>
                  <span>{formatHeight(row.heightCm)}</span>
                </p>
              ) : null}
              {hasJudge ? (
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.judge")}:
                  </span>
                  <span>{row.judge ?? "-"}</span>
                </p>
              ) : null}
              {hasReviewText ? (
                <p className="col-span-2">
                  <span className={beagleTheme.mutedText}>
                    {t("shows.details.col.reviewText")}:
                  </span>
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
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
