"use client";

import type {
  VirtualPairingDogOption,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
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

export function VirtualPairingSearchResultsTable({
  rows,
  onSelectSire,
  onSelectDam,
  t,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.ek")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.reg")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.sex")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.name")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.trials")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.shows")}
            </th>
            <th className="py-2 pr-3">
              {t("beagle.virtualPairing.search.col.select")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn("border-b last:border-b-0", beagleTheme.border)}
            >
              <td className="py-2 pr-3 tabular-nums">{row.ekNo ?? "-"}</td>
              <td className="py-2 pr-3">{row.registrationNo}</td>
              <td className="py-2 pr-3">{formatSex(row.sex, t)}</td>
              <td className="py-2 pr-3 font-medium">{row.name}</td>
              <td className="py-2 pr-3 tabular-nums">{row.trialCount}</td>
              <td className="py-2 pr-3 tabular-nums">{row.showCount}</td>
              <td className="py-2 pr-3">
                <VirtualPairingSearchResultActions
                  candidate={row}
                  onSelectSire={onSelectSire}
                  onSelectDam={onSelectDam}
                  t={t}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
