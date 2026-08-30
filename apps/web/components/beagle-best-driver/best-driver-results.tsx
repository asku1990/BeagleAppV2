"use client";

import { useState } from "react";
import Link from "next/link";
import type { BestDriverRankingRow } from "@beagle/contracts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  formatIsoDateForDisplay,
  getBeagleTrialHref,
} from "@/lib/public/beagle/trials";
import { cn } from "@/lib/utils";

function dogHref(dogId: string) {
  return `/beagle/dogs/${encodeURIComponent(dogId)}`;
}

function districtLabel(
  districtNo: string | null,
  districtName: string | null,
): string {
  const normalizedNo = districtNo?.trim();
  const normalizedName = districtName?.trim();
  if (normalizedNo && normalizedName)
    return `${normalizedNo} – ${normalizedName}`;
  return normalizedNo || normalizedName || "–";
}

export function BestDriverResults({ rows }: { rows: BestDriverRankingRow[] }) {
  const { t, locale } = useI18n();
  const [expandedDogId, setExpandedDogId] = useState<string | null>(null);
  const number = new Intl.NumberFormat(locale === "fi" ? "fi-FI" : "sv-FI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sexLabel = (sex: BestDriverRankingRow["sex"]) =>
    sex === "U"
      ? t("bestDriver.sex.male")
      : sex === "N"
        ? t("bestDriver.sex.female")
        : t("bestDriver.sex.unknown");
  const weatherLabel = (weather: string | null) =>
    weather === "P"
      ? t("bestDriver.results.bareGround")
      : weather === "L"
        ? t("bestDriver.results.snow")
        : weather || "–";
  const trialTypeLabel = (
    type: BestDriverRankingRow["results"][number]["trialType"],
  ) =>
    type === "KOKOKAUDENKOE"
      ? t("bestDriver.results.wholeSeasonTrial")
      : type === "PITKAKOE"
        ? t("bestDriver.results.longTrial")
        : t("bestDriver.results.normalTrial");

  const details = (row: BestDriverRankingRow) => (
    <div className="space-y-2 py-2">
      {row.results.map((result) => (
        <article
          key={result.trialEntryId}
          className={cn(
            "rounded-md border p-3 text-xs",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <strong>{result.eventPlace}</strong>
            <span>{formatIsoDateForDisplay(result.eventDate, locale)}</span>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
            <div>
              <dt className={beagleTheme.mutedText}>
                {t("bestDriver.results.district")}
              </dt>
              <dd>
                {districtLabel(result.kennelDistrictNo, result.kennelDistrict)}
              </dd>
            </div>
            <div>
              <dt className={beagleTheme.mutedText}>
                {t("bestDriver.results.weather")}
              </dt>
              <dd>{weatherLabel(result.weather)}</dd>
            </div>
            <div>
              <dt className={beagleTheme.mutedText}>
                {t("bestDriver.results.type")}
              </dt>
              <dd>{trialTypeLabel(result.trialType)}</dd>
            </div>
            <div>
              <dt className={beagleTheme.mutedText}>
                {t("bestDriver.results.placement")}
              </dt>
              <dd>{result.placement || "–"}</dd>
            </div>
            <div>
              <dt className={beagleTheme.mutedText}>
                {t("bestDriver.results.points")}
              </dt>
              <dd className="font-semibold tabular-nums">
                {number.format(result.points)}
              </dd>
            </div>
          </dl>
          <p className="mt-2">
            <Link
              href={getBeagleTrialHref(result.trialEventId)}
              className={beagleTheme.textLink}
            >
              {t("bestDriver.results.openTrial")}
            </Link>
          </p>
        </article>
      ))}
    </div>
  );

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-190 border-collapse text-sm">
          <thead>
            <tr className={cn("border-b text-left", beagleTheme.border)}>
              <th className="px-2 py-2">{t("bestDriver.results.position")}</th>
              <th className="px-2 py-2">{t("bestDriver.results.dog")}</th>
              <th className="px-2 py-2">
                {t("bestDriver.results.registration")}
              </th>
              <th className="px-2 py-2">{t("bestDriver.results.sex")}</th>
              <th className="px-2 py-2 text-right">
                {t("bestDriver.results.points")}
              </th>
              <th className="px-2 py-2 text-right">
                {t("bestDriver.results.details")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const expanded = expandedDogId === row.dogId;
              return [
                <tr
                  key={row.dogId}
                  className={cn("border-b", beagleTheme.border)}
                >
                  <td className="px-2 py-3 font-medium">{row.position}.</td>
                  <td className="px-2 py-3">
                    <Link
                      href={dogHref(row.dogId)}
                      className={beagleTheme.entityLink}
                    >
                      {row.dogName}
                    </Link>
                  </td>
                  <td className="px-2 py-3">{row.registrationNo}</td>
                  <td className="px-2 py-3">{sexLabel(row.sex)}</td>
                  <td className="px-2 py-3 text-right font-semibold tabular-nums">
                    {number.format(row.totalPoints)}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedDogId(expanded ? null : row.dogId)
                      }
                    >
                      {expanded ? <ChevronUp /> : <ChevronDown />}
                      {expanded
                        ? t("bestDriver.results.hide")
                        : t("bestDriver.results.show")}
                    </Button>
                  </td>
                </tr>,
                expanded ? (
                  <tr key={`${row.dogId}-details`}>
                    <td colSpan={6} className="px-4 pb-3">
                      {details(row)}
                    </td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const expanded = expandedDogId === row.dogId;
          return (
            <article
              key={row.dogId}
              className={cn(
                "rounded-lg border p-4",
                beagleTheme.border,
                beagleTheme.surface,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {row.position}.{" "}
                    <Link
                      href={dogHref(row.dogId)}
                      className={beagleTheme.entityLink}
                    >
                      {row.dogName}
                    </Link>
                  </p>
                  <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
                    {row.registrationNo} · {sexLabel(row.sex)}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">
                  {number.format(row.totalPoints)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                aria-expanded={expanded}
                onClick={() => setExpandedDogId(expanded ? null : row.dogId)}
              >
                {expanded ? <ChevronUp /> : <ChevronDown />}
                {expanded
                  ? t("bestDriver.results.hide")
                  : t("bestDriver.results.show")}
              </Button>
              {expanded ? details(row) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
