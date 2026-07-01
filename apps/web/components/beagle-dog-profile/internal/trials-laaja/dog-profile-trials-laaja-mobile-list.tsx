"use client";

import Link from "next/link";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { getBeagleTrialHref } from "@/lib/public/beagle/trials";
import {
  FALLBACK_VALUE,
  formatDate,
  formatNumber,
  formatPlacement,
} from "@/lib/public/beagle/trials/display-formatters";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileTrialRowDto } from "@beagle/contracts";
import { DogProfileTrialsEraRecap } from "./dog-profile-trials-era-recap";
import type { DogProfileTrialsLaajaHeaders } from "./dog-profile-trials-laaja-types";

export function DogProfileTrialsLaajaMobileList({
  rows,
  headers,
  showEraRecaps,
  locale,
}: {
  rows: BeagleDogProfileTrialRowDto[];
  headers: DogProfileTrialsLaajaHeaders;
  showEraRecaps: boolean;
  locale: "fi" | "sv";
}) {
  const hasWeather = rows.some((row) => row.weather != null);
  const hasAward = rows.some((row) => row.award != null);
  const hasRank = rows.some(
    (row) => row.rank != null || row.koetyyppi !== "NORMAL",
  );
  const hasPoints = rows.some((row) => row.points != null);
  const hasHaku = rows.some((row) => row.haku != null);
  const hasHauk = rows.some((row) => row.hauk != null);
  const hasAjotaito = rows.some((row) => row.yva != null);
  const hasHlo = rows.some((row) => row.hlo != null);
  const hasAlo = rows.some((row) => row.alo != null);
  const hasJudge = rows.some((row) => row.judge != null);
  const hasTja = rows.some((row) => row.tja != null);
  const hasPin = rows.some((row) => row.pin != null);

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
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
              <span className={beagleTheme.mutedText}>{headers.no}:</span>{" "}
              <span>{index + 1}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.date}:</span>{" "}
              <span>{formatDate(row.date, locale)}</span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>{headers.place}:</span>{" "}
              <Link
                href={getBeagleTrialHref(row.trialId)}
                className={beagleTheme.entityLink}
              >
                {row.place}
              </Link>
            </p>
            {hasWeather ? (
              <p>
                <span className={beagleTheme.mutedText}>
                  {headers.weather}:
                </span>{" "}
                <span>{row.weather ?? FALLBACK_VALUE}</span>
              </p>
            ) : null}
            {hasAward ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.award}:</span>{" "}
                <span>{row.award ?? FALLBACK_VALUE}</span>
              </p>
            ) : null}
            {hasRank ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.rank}:</span>{" "}
                <span>{formatPlacement(row)}</span>
              </p>
            ) : null}
            {hasPoints ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.points}:</span>{" "}
                <span>{formatNumber(row.points)}</span>
              </p>
            ) : null}
            {hasHaku ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.haku}:</span>{" "}
                <span>{formatNumber(row.haku)}</span>
              </p>
            ) : null}
            {hasHauk ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.hauk}:</span>{" "}
                <span>{formatNumber(row.hauk)}</span>
              </p>
            ) : null}
            {hasAjotaito ? (
              <p>
                <span className={beagleTheme.mutedText}>
                  {headers.ajotaito}:
                </span>{" "}
                <span>{formatNumber(row.yva)}</span>
              </p>
            ) : null}
            {hasHlo ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.hlo}:</span>{" "}
                <span>{formatNumber(row.hlo)}</span>
              </p>
            ) : null}
            {hasAlo ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.alo}:</span>{" "}
                <span>{formatNumber(row.alo)}</span>
              </p>
            ) : null}
            {hasJudge ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.judge}:</span>{" "}
                <span>{row.judge ?? FALLBACK_VALUE}</span>
              </p>
            ) : null}
            {hasTja ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.tja}:</span>{" "}
                <span>{formatNumber(row.tja)}</span>
              </p>
            ) : null}
            {hasPin ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.pin}:</span>{" "}
                <span>{formatNumber(row.pin)}</span>
              </p>
            ) : null}
          </div>
          {showEraRecaps && row.eras && row.eras.length > 0 ? (
            <div className="mt-3">
              <DogProfileTrialsEraRecap row={row} headers={headers} />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
