import React from "react";
import { useI18n } from "@/hooks/i18n";
import {
  ADMIN_TRIAL_LISATIETO_GROUP_LABELS,
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
  onChangeCell: (
    koodi: string,
    osa: string,
    era: number,
    value: string,
  ) => void;
};

export function LisatiedotMatrix({
  eras,
  rows,
  isPending,
  onChangeCell,
}: Props) {
  const { t } = useI18n();
  function sanitizeValue(
    kind: AdminTrialLisatietoInputKind,
    rawValue: string,
  ): string {
    if (kind === "marker" || kind === "tri-state") {
      if (rawValue === "1" || rawValue === "0" || rawValue === "") {
        return rawValue;
      }
      return "";
    }
    const normalized = rawValue.replace(",", ".");
    if (kind === "integer") {
      return normalized.replace(/[^\d-]/g, "");
    }
    if (kind === "text") {
      return rawValue;
    }
    return normalized.replace(/[^\d.-]/g, "");
  }

  const sortedEras = eras.slice().sort((left, right) => left.era - right.era);
  const groupedRows = rows.reduce<
    Array<{ group: string; rows: LisatietoRowDraft[] }>
  >((groups, row) => {
    const current = groups[groups.length - 1];
    if (current?.group === row.group) {
      current.rows.push(row);
    } else {
      groups.push({ group: row.group, rows: [row] });
    }
    return groups;
  }, []);

  return (
    <div className="rounded-md border">
      <div className="h-[280px] overflow-auto">
        <table className="w-max min-w-full whitespace-nowrap text-[10px] leading-none">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="sticky left-0 z-20 w-56 min-w-56 bg-muted px-2 py-1 font-semibold">
                Lisätieto
              </th>
              {sortedEras.map((era) => (
                <th
                  key={era.era}
                  className="w-16 min-w-16 px-0.5 py-1 text-center font-semibold"
                >
                  Erä {era.era}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedRows.map((group) => (
              <React.Fragment key={group.group}>
                <tr className="border-b bg-muted/25">
                  <td
                    className="sticky left-0 z-10 bg-muted px-2 py-1 text-[11px] font-semibold"
                    colSpan={1 + sortedEras.length}
                  >
                    {
                      ADMIN_TRIAL_LISATIETO_GROUP_LABELS[
                        group.group as keyof typeof ADMIN_TRIAL_LISATIETO_GROUP_LABELS
                      ]
                    }
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={`${row.koodi}:${row.osa}`} className="border-b">
                    <td className="sticky left-0 z-10 w-56 min-w-56 bg-background px-2 py-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-semibold">
                          {row.osa && !row.hideOsaSuffix
                            ? `${row.koodi} ${row.osa}`
                            : row.koodi}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {row.label}
                        </span>
                      </div>
                    </td>
                    {sortedEras.map((era) => (
                      <td key={era.era} className="w-16 min-w-16 px-0.5 py-0.5">
                        {row.inputKind === "marker" &&
                        row.useSemanticControl ? (
                          <input
                            type="checkbox"
                            aria-label={`${row.koodi} ${row.label}, ${t("admin.trials.manage.resultCreate.valueHint.marker")}, erä ${era.era}`}
                            checked={(row.eraValues[era.era] ?? "") === "1"}
                            disabled={isPending}
                            onChange={(event) =>
                              onChangeCell(
                                row.koodi,
                                row.osa,
                                era.era,
                                event.target.checked ? "1" : "",
                              )
                            }
                          />
                        ) : row.inputKind === "marker" ||
                          row.inputKind === "tri-state" ? (
                          <select
                            className="h-5 w-full rounded-sm border border-input bg-background px-0.5 text-center text-[10px] leading-none"
                            value={row.eraValues[era.era] ?? ""}
                            disabled={isPending}
                            onChange={(event) =>
                              onChangeCell(
                                row.koodi,
                                row.osa,
                                era.era,
                                event.target.value,
                              )
                            }
                          >
                            <option value="">-</option>
                            <option value="0">
                              {row.inputKind === "tri-state"
                                ? t(
                                    "admin.trials.manage.resultCreate.triState.no",
                                  )
                                : "0"}
                            </option>
                            <option value="1">
                              {row.inputKind === "tri-state"
                                ? t(
                                    "admin.trials.manage.resultCreate.triState.yes",
                                  )
                                : "1"}
                            </option>
                          </select>
                        ) : (
                          <input
                            className="h-5 w-full rounded-sm border border-input bg-background px-1 text-center text-[10px] leading-none"
                            inputMode={
                              row.inputKind === "text"
                                ? "text"
                                : row.inputKind === "integer"
                                  ? "numeric"
                                  : "decimal"
                            }
                            title={t(
                              `admin.trials.manage.resultCreate.valueHint.${row.valueHint ?? row.inputKind}` as never,
                            )}
                            value={row.eraValues[era.era] ?? ""}
                            disabled={isPending}
                            onChange={(event) =>
                              onChangeCell(
                                row.koodi,
                                row.osa,
                                era.era,
                                sanitizeValue(
                                  row.inputKind,
                                  event.target.value,
                                ),
                              )
                            }
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
