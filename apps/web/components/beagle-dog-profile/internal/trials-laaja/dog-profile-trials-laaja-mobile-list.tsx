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
import { DogProfileTrialsEraMobileTable } from "./dog-profile-trials-era-mobile-table";
import type { DogProfileTrialsLaajaHeaders } from "./dog-profile-trials-laaja-types";

export function DogProfileTrialsLaajaMobileList({
  rows,
  headers,
  showEraDetails,
  locale,
}: {
  rows: BeagleDogProfileTrialRowDto[];
  headers: DogProfileTrialsLaajaHeaders;
  showEraDetails: boolean;
  locale: "fi" | "sv";
}) {
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
            <p>
              <span className={beagleTheme.mutedText}>{headers.weather}:</span>{" "}
              <span>{row.weather ?? FALLBACK_VALUE}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.award}:</span>{" "}
              <span>{row.award ?? FALLBACK_VALUE}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.rank}:</span>{" "}
              <span>{formatPlacement(row)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.points}:</span>{" "}
              <span>{formatNumber(row.points)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.haku}:</span>{" "}
              <span>{formatNumber(row.haku)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.hauk}:</span>{" "}
              <span>{formatNumber(row.hauk)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.ajotaito}:</span>{" "}
              <span>{formatNumber(row.yva)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.hlo}:</span>{" "}
              <span>{formatNumber(row.hlo)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.alo}:</span>{" "}
              <span>{formatNumber(row.alo)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.judge}:</span>{" "}
              <span>{row.judge ?? FALLBACK_VALUE}</span>
            </p>
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
          {showEraDetails && row.eras && row.eras.length > 0 ? (
            <div className="mt-3">
              <DogProfileTrialsEraMobileTable row={row} headers={headers} />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
