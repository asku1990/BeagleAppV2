"use client";

import type {
  VirtualPairingDogOption,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";
import { VirtualPairingSearchResultActions } from "./virtual-pairing-search-result-actions";

type TranslateFn = (key: MessageKey) => string;

type Props = {
  rows: VirtualPairingSearchResponse["items"];
  onSelectSire: (candidate: VirtualPairingDogOption) => void;
  onSelectDam: (candidate: VirtualPairingDogOption) => void;
  t: TranslateFn;
};

function formatSex(
  value: VirtualPairingDogOption["sex"],
  t: TranslateFn,
): string {
  if (value === "U") return t("beagle.virtualPairing.search.sex.male");
  if (value === "N") return t("beagle.virtualPairing.search.sex.female");
  return t("beagle.virtualPairing.search.sex.unknown");
}

export function VirtualPairingSearchResultsCards({
  rows,
  onSelectSire,
  onSelectDam,
  t,
}: Props) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Card key={row.id} className={cn(beagleTheme.subpanel, "gap-0 py-0")}>
          <CardContent className="px-4 py-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold">{row.name}</div>
                  <div className={cn("text-sm", beagleTheme.mutedText)}>
                    {row.registrationNo}
                  </div>
                </div>
                <div className="text-sm tabular-nums text-right">
                  <div>EK {row.ekNo ?? "-"}</div>
                  <div>{formatSex(row.sex, t)}</div>
                </div>
              </div>
              <div className={cn("text-sm", beagleTheme.mutedText)}>
                {t("beagle.virtualPairing.search.col.trials")}: {row.trialCount}{" "}
                {t("beagle.virtualPairing.search.col.shows")}: {row.showCount}
              </div>
              <VirtualPairingSearchResultActions
                candidate={row}
                onSelectSire={onSelectSire}
                onSelectDam={onSelectDam}
                t={t}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
