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
      <td className="px-2 py-2 text-right">{ajominText}</td>
      <td className="px-2 py-2" />
      <td className="px-2 py-2" />
      <td className="px-2 py-2" />
      <td className="px-2 py-2" />
      <td className="px-2 py-2">{formatNumber(era.haku)}</td>
      <td className="px-2 py-2">{formatNumber(era.hauk)}</td>
      <td className="px-2 py-2">{formatNumber(era.yva)}</td>
      <td className="px-2 py-2">{formatNumber(era.hlo)}</td>
      <td className="px-2 py-2">{formatNumber(era.alo)}</td>
      <td className="px-2 py-2" />
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
