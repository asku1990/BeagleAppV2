"use client";

import type { VirtualPairingDogOption } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import type { MessageKey } from "@/lib/i18n/messages";

type TranslateFn = (key: MessageKey) => string;

type Props = {
  candidate: VirtualPairingDogOption;
  onSelectSire: (candidate: VirtualPairingDogOption) => void;
  onSelectDam: (candidate: VirtualPairingDogOption) => void;
  t: TranslateFn;
};

export function VirtualPairingSearchResultActions({
  candidate,
  onSelectSire,
  onSelectDam,
  t,
}: Props) {
  const canSelectSire = candidate.sex === "U";
  const canSelectDam = candidate.sex === "N";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!canSelectSire}
        onClick={() => onSelectSire(candidate)}
      >
        {t("beagle.virtualPairing.search.selectSire")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!canSelectDam}
        onClick={() => onSelectDam(candidate)}
      >
        {t("beagle.virtualPairing.search.selectDam")}
      </Button>
    </div>
  );
}
