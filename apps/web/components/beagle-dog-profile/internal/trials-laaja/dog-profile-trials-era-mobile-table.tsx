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
              <th className="px-2 py-2 font-semibold">{headers.alkoi}</th>
              <th className="px-2 py-2 font-semibold">{headers.hakumin}</th>
              <th className="px-2 py-2 font-semibold">{headers.ajomin}</th>
              <th className="px-2 py-2 font-semibold">{headers.haku}</th>
              <th className="px-2 py-2 font-semibold">{headers.hauk}</th>
              <th className="px-2 py-2 font-semibold">{headers.ajotaito}</th>
              <th className="px-2 py-2 font-semibold">{headers.hlo}</th>
              <th className="px-2 py-2 font-semibold">{headers.alo}</th>
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
                <td className="px-2 py-2">{era.alkoi ?? FALLBACK_VALUE}</td>
                <td className="px-2 py-2">{era.hakumin ?? FALLBACK_VALUE}</td>
                <td className="px-2 py-2">{era.ajomin ?? FALLBACK_VALUE}</td>
                <td className="px-2 py-2">{formatNumber(era.haku)}</td>
                <td className="px-2 py-2">{formatNumber(era.hauk)}</td>
                <td className="px-2 py-2">{formatNumber(era.yva)}</td>
                <td className="px-2 py-2">{formatNumber(era.hlo)}</td>
                <td className="px-2 py-2">{formatNumber(era.alo)}</td>
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
