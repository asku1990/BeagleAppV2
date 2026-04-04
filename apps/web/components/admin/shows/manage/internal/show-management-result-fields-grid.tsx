"use client";

import React from "react";
import { Input } from "@web/components/ui/input";
import type { AdminShowResultOption } from "@beagle/contracts";
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
  const pupnParts = getPupnParts(entry.pupn);
  const pupnPrefix = pupnParts.prefix;

  return (
    <>
      <label className="space-y-1 text-sm">
        <span>Judge</span>
        <Input
          value={entry.judge}
          disabled={isDisabled}
          onChange={(event) =>
            onEntryFieldChange(entry.id, "judge", event.target.value)
          }
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>Height</span>
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
        <span>Quality</span>
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
        <span>Class</span>
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
            placeholder="Placement"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Example: `AVO 8`. Class and placement stay paired.
        </p>
      </label>
      <label className="space-y-1 text-sm">
        <span>PUPN</span>
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
            placeholder="Rank"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Example: `PU8`. Choose `-` to clear the value.
        </p>
      </label>
    </>
  );
}
