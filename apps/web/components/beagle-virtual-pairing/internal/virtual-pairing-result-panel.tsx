"use client";

import Link from "next/link";
import type { CalculatePublicVirtualPairingResponse } from "@beagle/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";

type TranslateFn = (key: MessageKey) => string;
type PublicContribution =
  CalculatePublicVirtualPairingResponse["summary"]["contributions"][number];
type PublicPosition = PublicContribution["positions"][number];

type Props = {
  t: TranslateFn;
  result: CalculatePublicVirtualPairingResponse | null;
  showPositions: boolean;
  onShowPositionsChange: (value: boolean) => void;
};

function formatCoefficient(value: number | null): string {
  if (value == null) {
    return "-";
  }

  return `${value.toFixed(4)} %`;
}

function formatCoefficientWithRaw(
  adjusted: number | null,
  raw: number | null,
): string {
  if (adjusted == null) {
    return "-";
  }

  const base = formatCoefficient(adjusted);
  if (raw == null || Math.abs(raw - adjusted) < 0.000001) {
    return base;
  }

  return `${base} (${formatCoefficient(raw)})`;
}

function formatSummaryPct(value: number): string {
  return `${value.toFixed(2)} %`;
}

function formatContribution(contribution: PublicContribution) {
  const adjusted = formatCoefficient(contribution.contributionPct);
  const raw = formatCoefficient(contribution.rawContributionPct);
  return raw === adjusted ? adjusted : `${adjusted} (${raw})`;
}

export function VirtualPairingResultPanel({
  t,
  result,
  showPositions,
  onShowPositionsChange,
}: Props) {
  if (!result) {
    return (
      <Card className={cn(beagleTheme.panel, "gap-0 py-0")}>
        <CardContent className="px-5 py-5 md:px-6 md:py-6">
          <p className={cn("text-sm", beagleTheme.mutedText)}>
            {t("beagle.virtualPairing.result.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className={cn(beagleTheme.panel, "gap-0 py-0")}>
        <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
          <CardTitle
            className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
          >
            {t("beagle.virtualPairing.result.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <div className="rounded-lg border p-4">
                <div className={cn("text-sm", beagleTheme.mutedText)}>
                  {t("beagle.virtualPairing.result.inbreedingLabel")}
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {formatCoefficientWithRaw(
                    result.inbreedingCoefficientPct,
                    result.rawInbreedingCoefficientPct,
                  )}
                </div>
                <div className="mt-2 text-sm">
                  {result.sire.name} / {result.dam.name}
                </div>
                <div className={cn("text-sm", beagleTheme.mutedText)}>
                  {t("beagle.virtualPairing.result.knownPedigreeLine")
                    .replace(
                      "{generationDepth}",
                      String(result.generationDepth),
                    )
                    .replace(
                      "{knownPedigreePct}",
                      formatSummaryPct(result.summary.knownPedigreePct),
                    )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span>
                    {t("beagle.virtualPairing.result.health.summary")}:
                  </span>
                  <span className="font-semibold tabular-nums">
                    {result.health.risk.display}
                  </span>
                  <Link
                    href="/beagle/virtual-pairing/epi-info"
                    className={cn("text-sm", beagleTheme.actionLink)}
                  >
                    {t("beagle.virtualPairing.result.health.infoLink")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border p-4 text-sm">
                <div>
                  {t("beagle.virtualPairing.result.sharedAncestors")}{" "}
                  {result.summary.sharedAncestorCount} kpl (
                  {result.summary.sharedOccurrenceCount} kpl)
                </div>
                <div>
                  {t("beagle.virtualPairing.result.occurrences")}{" "}
                  {result.summary.includedPositionCount} kpl (I=
                  {result.summary.includedSirePositionCount} kpl, E=
                  {result.summary.includedDamPositionCount} kpl)
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showPositions}
                    onChange={(event) =>
                      onShowPositionsChange(event.target.checked)
                    }
                  />
                  <span>{t("beagle.virtualPairing.result.positions")}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-semibold tracking-wide">
                  {t("beagle.virtualPairing.result.basisTitle")}
                </div>
                <ol className="mt-3 space-y-2 text-sm">
                  {result.summary.contributions.map(
                    (contribution: PublicContribution, index: number) => (
                      <li key={contribution.ancestorId}>
                        <div className="font-mono">
                          {String(index + 1).padStart(2, " ")}.{" "}
                          {contribution.label} =&gt;{" "}
                          {formatContribution(contribution)}
                        </div>
                        {showPositions && contribution.positions.length > 0 ? (
                          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                            {contribution.positions.map(
                              (
                                position: PublicPosition,
                                positionIndex: number,
                              ) => (
                                <li
                                  key={`${contribution.ancestorId}-${positionIndex}`}
                                >
                                  I {position.sireGeneration}.
                                  {position.sireIndex} / E{" "}
                                  {position.damGeneration}.{position.damIndex}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : null}
                      </li>
                    ),
                  )}
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
