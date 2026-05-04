import React from "react";
import {
  ADMIN_TRIAL_LISATIETO_INPUT_KIND,
  type AdminTrialLisatietoInputKind,
} from "@/lib/admin/trials/entry-edit-config";
import type {
  EraDraft,
  LisatietoRowDraft,
} from "@/lib/admin/trials/entry-edit-dialog-model";

type Props = {
  eras: EraDraft[];
  rows: LisatietoRowDraft[];
  isPending: boolean;
  onChangeCell: (koodi: string, era: number, value: string) => void;
};

export function LisatiedotMatrix({
  eras,
  rows,
  isPending,
  onChangeCell,
}: Props) {
  function sanitizeValue(
    kind: AdminTrialLisatietoInputKind,
    rawValue: string,
  ): string {
    if (kind === "marker") {
      if (rawValue === "1" || rawValue === "0" || rawValue === "") {
        return rawValue;
      }
      return "";
    }
    const normalized = rawValue.replace(",", ".");
    if (kind === "integer") {
      return normalized.replace(/[^\d-]/g, "");
    }
    return normalized.replace(/[^\d.-]/g, "");
  }

  return (
    <div className="rounded-md border">
      <div className="h-[280px] overflow-auto">
        <table className="w-max min-w-max whitespace-nowrap text-[10px] leading-none">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="sticky left-0 z-20 w-12 min-w-12 bg-muted px-1 py-1 font-semibold">
                Koodi
              </th>
              {eras
                .slice()
                .sort((left, right) => left.era - right.era)
                .map((era) => (
                  <th
                    key={era.era}
                    className="w-14 min-w-14 px-0.5 py-1 text-center font-semibold"
                  >
                    Erä {era.era}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.koodi} className="border-b">
                <td className="sticky left-0 z-10 w-12 min-w-12 bg-background px-1 py-1 font-medium">
                  {row.koodi}
                </td>
                {eras
                  .slice()
                  .sort((left, right) => left.era - right.era)
                  .map((era) => (
                    <td key={era.era} className="w-14 min-w-14 px-0.5 py-0.5">
                      {ADMIN_TRIAL_LISATIETO_INPUT_KIND[
                        row.koodi as keyof typeof ADMIN_TRIAL_LISATIETO_INPUT_KIND
                      ] === "marker" ? (
                        <select
                          className="h-5 w-full rounded-sm border border-input bg-background px-0.5 text-center text-[10px] leading-none"
                          value={row.eraValues[era.era] ?? ""}
                          disabled={isPending}
                          onChange={(event) =>
                            onChangeCell(row.koodi, era.era, event.target.value)
                          }
                        >
                          <option value="">-</option>
                          <option value="0">0</option>
                          <option value="1">1</option>
                        </select>
                      ) : (
                        <input
                          className="h-5 w-full rounded-sm border border-input bg-background px-1 text-center text-[10px] leading-none"
                          inputMode="decimal"
                          value={row.eraValues[era.era] ?? ""}
                          disabled={isPending}
                          onChange={(event) => {
                            const kind =
                              ADMIN_TRIAL_LISATIETO_INPUT_KIND[
                                row.koodi as keyof typeof ADMIN_TRIAL_LISATIETO_INPUT_KIND
                              ];
                            onChangeCell(
                              row.koodi,
                              era.era,
                              sanitizeValue(kind, event.target.value),
                            );
                          }}
                        />
                      )}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
