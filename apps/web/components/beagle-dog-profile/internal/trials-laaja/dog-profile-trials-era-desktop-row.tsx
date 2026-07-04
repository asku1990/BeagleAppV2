"use client";

import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  FALLBACK_VALUE,
  formatNumber,
} from "@/lib/public/beagle/trials/display-formatters";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileTrialEraDto } from "@beagle/contracts";
import type { DogProfileTrialsLaajaHeaders } from "./dog-profile-trials-laaja-types";

type DogProfileTrialsEraDesktopRowProps = {
  era: BeagleDogProfileTrialEraDto;
  headers: DogProfileTrialsLaajaHeaders;
  columns: {
    hasWeather: boolean;
    hasAward: boolean;
    hasRank: boolean;
    hasPoints: boolean;
    hasHaku: boolean;
    hasHauk: boolean;
    hasAjotaito: boolean;
    hasHlo: boolean;
    hasAlo: boolean;
    hasJudge: boolean;
    hasEraHuomautus: boolean;
    hasTja: boolean;
    hasPin: boolean;
  };
  rowId: string;
};

export function DogProfileTrialsEraDesktopRow({
  era,
  headers,
  columns,
  rowId,
}: DogProfileTrialsEraDesktopRowProps) {
  const ajominText = `${headers.ajomin}: ${era.ajomin ?? FALLBACK_VALUE}`;
  const ajominColumn = columns.hasWeather
    ? "weather"
    : columns.hasAward
      ? "award"
      : columns.hasRank
        ? "rank"
        : columns.hasPoints
          ? "points"
          : null;

  return (
    <tr
      key={`${rowId}-era-${era.era}`}
      className={cn(
        "border-b align-top text-xs",
        beagleTheme.border,
        beagleTheme.softAccent,
      )}
    >
      <td className="px-2 py-2" />
      <td className="px-2 py-2 font-medium">
        {headers.era}: {era.era}.
        {era.alkoi ? (
          <span className="ml-2 font-normal">
            {headers.alkoi}: {era.alkoi}
          </span>
        ) : null}
      </td>
      <td className="px-2 py-2 text-right">
        {headers.hakumin}: {era.hakumin ?? FALLBACK_VALUE}
      </td>
      {columns.hasWeather ? (
        <td className="px-2 py-2 text-right">
          {ajominColumn === "weather" ? ajominText : ""}
        </td>
      ) : null}
      {columns.hasAward ? (
        <td className="px-2 py-2 text-right">
          {ajominColumn === "award" ? ajominText : ""}
        </td>
      ) : null}
      {columns.hasRank ? (
        <td className="px-2 py-2 text-right">
          {ajominColumn === "rank" ? ajominText : ""}
        </td>
      ) : null}
      {columns.hasPoints ? (
        <td className="px-2 py-2 text-right">
          {ajominColumn === "points" ? ajominText : ""}
        </td>
      ) : null}
      {columns.hasHaku ? (
        <td className="px-2 py-2">{formatNumber(era.haku)}</td>
      ) : null}
      {columns.hasHauk ? (
        <td className="px-2 py-2">{formatNumber(era.hauk)}</td>
      ) : null}
      {columns.hasAjotaito ? (
        <td className="px-2 py-2">{formatNumber(era.yva)}</td>
      ) : null}
      {columns.hasHlo ? (
        <td className="px-2 py-2">{formatNumber(era.hlo)}</td>
      ) : null}
      {columns.hasAlo ? (
        <td className="px-2 py-2">{formatNumber(era.alo)}</td>
      ) : null}
      {columns.hasJudge ? <td className="px-2 py-2" /> : null}
      {columns.hasEraHuomautus ? (
        <td className="px-2 py-2">{era.huomautusTeksti ?? FALLBACK_VALUE}</td>
      ) : null}
      {columns.hasTja ? (
        <td className="px-2 py-2">{formatNumber(era.tja)}</td>
      ) : null}
      {columns.hasPin ? (
        <td className="px-2 py-2">{formatNumber(era.pin)}</td>
      ) : null}
    </tr>
  );
}
