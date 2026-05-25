"use client";

// Shared EPI value renderer used by admin dog profile and virtual pairing.
// It preserves the legacy admin value, color dot, tooltip, and class number
// label so both views stay visually consistent.

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

const FALLBACK_VALUE = "-";

type EpiFlagLevel = "green" | "yellow" | "red";

type EpiFlagMeta = {
  level: EpiFlagLevel;
  classNo: 1 | 2 | 3;
};

function showDash(value: string | null | undefined): string {
  if (value == null) {
    return FALLBACK_VALUE;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : FALLBACK_VALUE;
}

function formatEpiLuku(
  epiLuku: number | null,
  epiTeksti: string | null,
): string {
  if (epiLuku == null) {
    return FALLBACK_VALUE;
  }

  // This shared UI owns the legacy admin/profile precision. DTO display
  // strings are still used by other health metric rows.
  return `${epiLuku.toFixed(4)} ${showDash(epiTeksti)}`;
}

// Maps the numeric EPI value to the old hallinta flag buckets:
// 1 = green, 2 = yellow, 3 = red.
function getEpiFlagMeta(epiLuku: number | null): EpiFlagMeta | null {
  if (epiLuku == null) {
    return null;
  }

  if (epiLuku < 1.0) {
    return { level: "green", classNo: 1 };
  }

  if (epiLuku <= 1.5) {
    return { level: "yellow", classNo: 2 };
  }

  return { level: "red", classNo: 3 };
}

function epiFlagClassName(level: EpiFlagLevel): string {
  if (level === "green") {
    return "bg-emerald-500";
  }

  if (level === "yellow") {
    return "bg-amber-400";
  }

  return "bg-red-500";
}

function InlineHelpTooltip({
  tooltip,
  ariaLabel,
  children,
}: {
  tooltip: ReactNode;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex cursor-help appearance-none border-0 bg-transparent p-0 align-middle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function EpiLukuWithFlag({
  epiLuku,
  epiTeksti,
}: {
  epiLuku: number | null;
  epiTeksti: string | null;
}) {
  const value = formatEpiLuku(epiLuku, epiTeksti);
  const flag = getEpiFlagMeta(epiLuku);

  if (!flag) {
    return <span>{value}</span>;
  }

  const epiVariLabel =
    flag.classNo === 1
      ? "Vihreä(1)"
      : flag.classNo === 2
        ? "Keltainen(2)"
        : "Punainen(3)";
  const tooltipLabel = [
    `EPI-luku: ${value} => ${epiVariLabel}`,
    "- Vihreä(1) jos Epi < 1.0",
    "- Keltainen(2) jos Epi >= 1.0 mutta Epi <= 1.5",
    "- Punainen(3) jos Epi > 1.5",
  ].join("\n");
  const tooltip = (
    <div className="space-y-1">
      <div>{`EPI-luku: ${value} => ${epiVariLabel}`}</div>
      <div>{`- Vihreä(1) jos Epi < 1.0`}</div>
      <div>{`- Keltainen(2) jos Epi >= 1.0 mutta Epi <= 1.5`}</div>
      <div>{`- Punainen(3) jos Epi > 1.5`}</div>
    </div>
  );

  return (
    // Virtual pairing does not have its own page-level provider, so this keeps
    // the shared admin profile and virtual pairing EPI tooltip self-contained.
    <TooltipProvider>
      <span className="inline-flex items-center gap-2">
        <span>{value}</span>
        <InlineHelpTooltip tooltip={tooltip} ariaLabel={tooltipLabel}>
          <span
            data-testid="epi-flag"
            data-epi-flag={flag.level}
            className={cn(
              "inline-block size-2.5 rounded-full align-middle",
              epiFlagClassName(flag.level),
            )}
          />
        </InlineHelpTooltip>
        <span>( {flag.classNo} )</span>
      </span>
    </TooltipProvider>
  );
}
