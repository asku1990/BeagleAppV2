"use client";

import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  FALLBACK_VALUE,
  formatNumber,
} from "@/lib/public/beagle/trials/display-formatters";
import { cn } from "@/lib/utils";
import type {
  BeagleDogProfileTrialEraDto,
  BeagleDogProfileTrialRowDto,
} from "@beagle/contracts";
import type { DogProfileTrialsEraHeaders } from "./dog-profile-trials-laaja-types";

function hasEraValue(
  era: BeagleDogProfileTrialEraDto,
  field: keyof BeagleDogProfileTrialEraDto,
): boolean {
  return era[field] != null && era[field] !== "";
}

export function DogProfileTrialsEraMobileTable({
  row,
  headers,
}: {
  row: BeagleDogProfileTrialRowDto;
  headers: DogProfileTrialsEraHeaders;
}) {
  const eras = row.eras ?? [];
  const hasAlkoi = eras.some((era) => hasEraValue(era, "alkoi"));
  const hasHakumin = eras.some((era) => hasEraValue(era, "hakumin"));
  const hasAjomin = eras.some((era) => hasEraValue(era, "ajomin"));
  const hasHaku = eras.some((era) => hasEraValue(era, "haku"));
  const hasHauk = eras.some((era) => hasEraValue(era, "hauk"));
  const hasAjotaito = eras.some((era) => hasEraValue(era, "yva"));
  const hasHlo = eras.some((era) => hasEraValue(era, "hlo"));
  const hasAlo = eras.some((era) => hasEraValue(era, "alo"));
  const hasTja = eras.some((era) => hasEraValue(era, "tja"));
  const hasPin = eras.some((era) => hasEraValue(era, "pin"));
  const hasHuomautus = eras.some((era) => hasEraValue(era, "huomautusTeksti"));

  return (
    <div className={cn("border-t pt-3", beagleTheme.border)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr className={cn("border-b text-left", beagleTheme.border)}>
              <th className="px-2 py-2 font-semibold">{headers.era}</th>
              {hasAlkoi ? (
                <th className="px-2 py-2 font-semibold">{headers.alkoi}</th>
              ) : null}
              {hasHakumin ? (
                <th className="px-2 py-2 font-semibold">{headers.hakumin}</th>
              ) : null}
              {hasAjomin ? (
                <th className="px-2 py-2 font-semibold">{headers.ajomin}</th>
              ) : null}
              {hasHaku ? (
                <th className="px-2 py-2 font-semibold">{headers.haku}</th>
              ) : null}
              {hasHauk ? (
                <th className="px-2 py-2 font-semibold">{headers.hauk}</th>
              ) : null}
              {hasAjotaito ? (
                <th className="px-2 py-2 font-semibold">{headers.ajotaito}</th>
              ) : null}
              {hasHlo ? (
                <th className="px-2 py-2 font-semibold">{headers.hlo}</th>
              ) : null}
              {hasAlo ? (
                <th className="px-2 py-2 font-semibold">{headers.alo}</th>
              ) : null}
              {hasTja ? (
                <th className="px-2 py-2 font-semibold">{headers.tja}</th>
              ) : null}
              {hasPin ? (
                <th className="px-2 py-2 font-semibold">{headers.pin}</th>
              ) : null}
              {hasHuomautus ? (
                <th className="px-2 py-2 font-semibold">{headers.huomautus}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {eras.map((era) => (
              <tr
                key={era.era}
                className={cn("border-b last:border-b-0", beagleTheme.border)}
              >
                <td className="px-2 py-2 font-medium">{era.era}</td>
                {hasAlkoi ? (
                  <td className="px-2 py-2">{era.alkoi ?? FALLBACK_VALUE}</td>
                ) : null}
                {hasHakumin ? (
                  <td className="px-2 py-2">{era.hakumin ?? FALLBACK_VALUE}</td>
                ) : null}
                {hasAjomin ? (
                  <td className="px-2 py-2">{era.ajomin ?? FALLBACK_VALUE}</td>
                ) : null}
                {hasHaku ? (
                  <td className="px-2 py-2">{formatNumber(era.haku)}</td>
                ) : null}
                {hasHauk ? (
                  <td className="px-2 py-2">{formatNumber(era.hauk)}</td>
                ) : null}
                {hasAjotaito ? (
                  <td className="px-2 py-2">{formatNumber(era.yva)}</td>
                ) : null}
                {hasHlo ? (
                  <td className="px-2 py-2">{formatNumber(era.hlo)}</td>
                ) : null}
                {hasAlo ? (
                  <td className="px-2 py-2">{formatNumber(era.alo)}</td>
                ) : null}
                {hasTja ? (
                  <td className="px-2 py-2">{formatNumber(era.tja)}</td>
                ) : null}
                {hasPin ? (
                  <td className="px-2 py-2">{formatNumber(era.pin)}</td>
                ) : null}
                {hasHuomautus ? (
                  <td className="px-2 py-2">
                    {era.huomautusTeksti ?? FALLBACK_VALUE}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
