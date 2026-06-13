"use client";

import type { VirtualPairingDogOption } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";

type TranslateFn = (key: MessageKey) => string;
const GENERATION_DEPTH_OPTIONS = Array.from({ length: 9 }, (_, index) =>
  String(index + 4),
);

type Props = {
  t: TranslateFn;
  sire: VirtualPairingDogOption | null;
  dam: VirtualPairingDogOption | null;
  generationDepth: string;
  isCalculating: boolean;
  canCalculate: boolean;
  selectionMessage: string | null;
  calculationMessage: string | null;
  onClearSire: () => void;
  onClearDam: () => void;
  onGenerationDepthChange: (value: string) => void;
  onCalculate: () => void;
};

function ParentSlot({
  title,
  candidate,
  onClear,
  t,
}: {
  title: string;
  candidate: VirtualPairingDogOption | null;
  onClear: () => void;
  t: TranslateFn;
}) {
  return (
    <div className={cn("rounded-lg border p-4", beagleTheme.border)}>
      <div className={cn("text-sm font-medium", beagleTheme.inkStrongText)}>
        {title}
      </div>
      {candidate ? (
        <div className="mt-2 space-y-1">
          <div className="font-semibold">{candidate.name}</div>
          <div className={cn("text-sm", beagleTheme.mutedText)}>
            {candidate.registrationNo}
          </div>
          <div className="text-sm">
            {candidate.ekNo != null ? `EK ${candidate.ekNo}` : "EK -"} ·{" "}
            {candidate.sex === "U"
              ? t("beagle.virtualPairing.search.sex.male")
              : candidate.sex === "N"
                ? t("beagle.virtualPairing.search.sex.female")
                : t("beagle.virtualPairing.search.sex.unknown")}
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>
            {t("beagle.virtualPairing.selected.clear")}
          </Button>
        </div>
      ) : (
        <div className={cn("mt-2 text-sm", beagleTheme.mutedText)}>
          {t("beagle.virtualPairing.selected.none")}
        </div>
      )}
    </div>
  );
}

export function VirtualPairingSelectionPanel({
  t,
  sire,
  dam,
  generationDepth,
  isCalculating,
  canCalculate,
  selectionMessage,
  calculationMessage,
  onClearSire,
  onClearDam,
  onGenerationDepthChange,
  onCalculate,
}: Props) {
  return (
    <Card className={cn(beagleTheme.panel, "gap-0 py-0")}>
      <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
        <CardTitle
          className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
        >
          {t("beagle.virtualPairing.selected.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
        <div className="space-y-4">
          {selectionMessage ? (
            <p className="text-sm text-destructive">{selectionMessage}</p>
          ) : null}
          {calculationMessage ? (
            <p className="text-sm text-destructive">{calculationMessage}</p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <ParentSlot
              title={t("beagle.virtualPairing.selected.sire")}
              candidate={sire}
              onClear={onClearSire}
              t={t}
            />
            <ParentSlot
              title={t("beagle.virtualPairing.selected.dam")}
              candidate={dam}
              onClear={onClearDam}
              t={t}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span
                className={cn("text-sm font-medium", beagleTheme.inkStrongText)}
              >
                {t("beagle.virtualPairing.generationDepth.label")}
              </span>
              <select
                value={generationDepth}
                onChange={(event) =>
                  onGenerationDepthChange(event.target.value)
                }
                className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {GENERATION_DEPTH_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              onClick={onCalculate}
              disabled={!canCalculate || isCalculating}
            >
              {isCalculating
                ? t("beagle.virtualPairing.calculate.pending")
                : t("beagle.virtualPairing.calculate.button")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
