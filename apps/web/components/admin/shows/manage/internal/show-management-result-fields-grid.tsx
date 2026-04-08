"use client";

import React from "react";
import { Input } from "@web/components/ui/input";
import type { AdminShowResultOption } from "@beagle/contracts";
import { useI18n } from "@/hooks/i18n";
import type { ManageShowEntry } from "../show-management-types";

type ShowManagementResultFieldsGridProps = {
  entry: ManageShowEntry;
  classOptions: AdminShowResultOption[];
  qualityOptions: AdminShowResultOption[];
  isDisabled?: boolean;
  onEntryFieldChange: (
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) => void;
};

function getPupnParts(value: string): {
  prefix: "-" | "PU" | "PN";
  rank: string;
} {
  const match = value.trim().match(/^(PU|PN)(\d*)$/i);
  if (!match) {
    return { prefix: "-", rank: "" };
  }

  return {
    prefix: match[1].toUpperCase() as "PU" | "PN",
    rank: match[2],
  };
}

export function ShowManagementResultFieldsGrid({
  entry,
  classOptions,
  qualityOptions,
  isDisabled = false,
  onEntryFieldChange,
}: ShowManagementResultFieldsGridProps) {
  const { t } = useI18n();
  const pupnParts = getPupnParts(entry.pupn);
  const pupnPrefix = pupnParts.prefix;

  return (
    <>
      <label className="space-y-1 text-sm">
        <span>{t("admin.shows.manage.results.judge")}</span>
        <Input
          value={entry.judge}
          disabled={isDisabled}
          onChange={(event) =>
            onEntryFieldChange(entry.id, "judge", event.target.value)
          }
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.shows.manage.entryResults.height")}</span>
        <Input
          type="number"
          inputMode="numeric"
          disabled={isDisabled}
          value={entry.heightCm}
          onChange={(event) =>
            onEntryFieldChange(entry.id, "heightCm", event.target.value)
          }
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>{t("admin.shows.manage.entryResults.quality")}</span>
        <select
          value={entry.qualityGrade}
          onChange={(event) =>
            onEntryFieldChange(entry.id, "qualityGrade", event.target.value)
          }
          disabled={isDisabled || qualityOptions.length === 0}
          className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">-</option>
          {qualityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span>{t("admin.shows.manage.entryResults.classResult")}</span>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
          <select
            value={entry.classCode}
            onChange={(event) =>
              onEntryFieldChange(entry.id, "classCode", event.target.value)
            }
            disabled={isDisabled || classOptions.length === 0}
            className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <option value="">-</option>
            {classOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            disabled={isDisabled}
            value={entry.classPlacement}
            onChange={(event) =>
              onEntryFieldChange(entry.id, "classPlacement", event.target.value)
            }
            placeholder={t(
              "admin.shows.manage.resultFields.placementPlaceholder",
            )}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {t("admin.shows.manage.resultFields.classHelp")}
        </p>
      </label>
      <label className="space-y-1 text-sm">
        <span>{t("admin.shows.manage.entryResults.pupn")}</span>
        <div className="grid gap-2 sm:grid-cols-[88px_minmax(0,1fr)]">
          <select
            value={pupnPrefix}
            disabled={isDisabled}
            onChange={(event) => {
              const prefix =
                event.target.value === "PU" || event.target.value === "PN"
                  ? event.target.value
                  : "-";
              if (prefix === "-") {
                onEntryFieldChange(entry.id, "pupn", "");
                return;
              }
              const rank = pupnParts.rank;
              onEntryFieldChange(
                entry.id,
                "pupn",
                rank ? `${prefix}${rank}` : prefix,
              );
            }}
            className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <option value="-">-</option>
            <option value="PU">PU</option>
            <option value="PN">PN</option>
          </select>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={pupnParts.rank}
            disabled={isDisabled || pupnPrefix === "-"}
            onChange={(event) => {
              const rank = event.target.value;
              if (!rank) {
                onEntryFieldChange(
                  entry.id,
                  "pupn",
                  pupnPrefix === "-" ? "" : pupnPrefix,
                );
                return;
              }
              onEntryFieldChange(
                entry.id,
                "pupn",
                pupnPrefix === "-" ? "" : `${pupnPrefix}${rank}`,
              );
            }}
            placeholder={t("admin.shows.manage.resultFields.rankPlaceholder")}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {t("admin.shows.manage.resultFields.pupnHelp")}
        </p>
      </label>
    </>
  );
}
