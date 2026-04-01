"use client";

import React from "react";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import type {
  ManageShowEditOptions,
  ManageShowEntry,
} from "./show-management-types";

type ShowManagementEntryCardProps = {
  entry: ManageShowEntry;
  resultOptions: ManageShowEditOptions;
  isDirty: boolean;
  onChange: (
    entryId: string,
    patch: Partial<Omit<ManageShowEntry, "id">>,
  ) => void;
  onRemove: (entry: ManageShowEntry) => void;
  onApply: (entry: ManageShowEntry) => void;
};

const DEFAULT_PLACEMENT_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
];

function ensureOptionExists(
  options: ManageShowEditOptions["classOptions"],
  value: string,
): ManageShowEditOptions["classOptions"] {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return options;
  }
  if (options.some((option) => option.value === normalizedValue)) {
    return options;
  }
  return [
    ...options,
    {
      value: normalizedValue,
      label: `${normalizedValue} - Unknown current value`,
    },
  ];
}

function getMissingAwardOptions(
  options: ManageShowEditOptions["awardOptions"],
  values: string[],
): ManageShowEditOptions["awardOptions"] {
  const knownValues = new Set(options.map((option) => option.value));
  const missingOptions = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value) => !knownValues.has(value))
    .map((value) => ({
      value,
      label: `${value} - Unknown current value`,
    }));

  return [...options, ...missingOptions];
}

export function ShowManagementEntryCard({
  entry,
  resultOptions,
  isDirty,
  onChange,
  onRemove,
  onApply,
}: ShowManagementEntryCardProps) {
  const optionsUnavailable =
    resultOptions.classOptions.length === 0 &&
    resultOptions.qualityOptions.length === 0 &&
    resultOptions.awardOptions.length === 0 &&
    resultOptions.pupnOptions.length === 0;
  const classOptions = ensureOptionExists(
    resultOptions.classOptions,
    entry.classCode,
  );
  const qualityOptions = ensureOptionExists(
    resultOptions.qualityOptions,
    entry.qualityGrade,
  );
  const pupnOptions = ensureOptionExists(resultOptions.pupnOptions, entry.pupn);
  const placementOptions = ensureOptionExists(
    DEFAULT_PLACEMENT_OPTIONS,
    entry.classPlacement,
  );
  const awardOptions = getMissingAwardOptions(
    resultOptions.awardOptions,
    entry.awards,
  );
  const availableAwardOptions = awardOptions.filter(
    (option) => !entry.awards.includes(option.value),
  );
  const awardsDisabled = awardOptions.length === 0;
  const selectedAwardsText =
    entry.awards.length > 0 ? entry.awards.join(", ") : "-";
  const selectedClassText = entry.classCode.trim() || "-";
  const selectedPlacementText = entry.classPlacement.trim();
  const selectedClassResultText =
    selectedClassText === "-"
      ? "-"
      : selectedPlacementText
        ? `${selectedClassText} ${selectedPlacementText}`
        : selectedClassText;
  const selectedQualityText = entry.qualityGrade.trim() || "-";
  const selectedPupnText = entry.pupn.trim() || "-";

  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">{entry.dogName}</p>
            <p className="text-sm text-muted-foreground">
              {entry.registrationNo}
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onRemove(entry)}
          >
            Remove dog
          </Button>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Current selection</p>
          <p className="text-xs">
            <span className="text-muted-foreground">Class:</span>{" "}
            <span>{selectedClassResultText}</span>
          </p>
          <p className="text-xs">
            <span className="text-muted-foreground">Quality:</span>{" "}
            <span>{selectedQualityText}</span>
          </p>
          <p className="text-xs">
            <span className="text-muted-foreground">PUPN:</span>{" "}
            <span>{selectedPupnText}</span>
          </p>
          <p className="text-xs">
            <span className="text-muted-foreground">Awards:</span>{" "}
            <span>{selectedAwardsText}</span>
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Judge</span>
            <Input
              value={entry.judge}
              onChange={(event) =>
                onChange(entry.id, { judge: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Height</span>
            <Input
              type="number"
              inputMode="numeric"
              value={entry.heightCm}
              onChange={(event) =>
                onChange(entry.id, { heightCm: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Critique</span>
            <textarea
              value={entry.critiqueText}
              onChange={(event) =>
                onChange(entry.id, { critiqueText: event.target.value })
              }
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Class</span>
            <select
              value={entry.classCode}
              onChange={(event) =>
                onChange(entry.id, { classCode: event.target.value })
              }
              disabled={classOptions.length === 0}
              className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">-</option>
              {classOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Quality</span>
            <select
              value={entry.qualityGrade}
              onChange={(event) =>
                onChange(entry.id, { qualityGrade: event.target.value })
              }
              disabled={qualityOptions.length === 0}
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
          <label className="space-y-1 text-sm">
            <span>Placement</span>
            <select
              value={entry.classPlacement}
              onChange={(event) =>
                onChange(entry.id, { classPlacement: event.target.value })
              }
              className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">-</option>
              {placementOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>PUPN</span>
            <select
              value={entry.pupn}
              onChange={(event) =>
                onChange(entry.id, { pupn: event.target.value })
              }
              disabled={pupnOptions.length === 0}
              className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">-</option>
              {pupnOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Awards</span>
            <div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
              {entry.awards.length === 0 ? (
                <span className="text-xs text-muted-foreground">-</span>
              ) : (
                entry.awards.map((award) => (
                  <button
                    key={award}
                    type="button"
                    onClick={() =>
                      onChange(entry.id, {
                        awards: entry.awards.filter((value) => value !== award),
                      })
                    }
                    className="bg-muted text-foreground hover:bg-muted/80 rounded-full px-2 py-1 text-xs"
                  >
                    {award} ×
                  </button>
                ))
              )}
            </div>
            <select
              value=""
              onChange={(event) =>
                event.target.value
                  ? onChange(entry.id, {
                      awards: [...entry.awards, event.target.value],
                    })
                  : undefined
              }
              disabled={awardsDisabled || availableAwardOptions.length === 0}
              className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">-</option>
              {availableAwardOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Selected awards appear as badges. Click a badge to remove it.
            </p>
          </label>
        </div>
        {optionsUnavailable ? (
          <p className="text-xs text-destructive">
            Result options are currently unavailable from the database.
          </p>
        ) : null}

        {isDirty ? (
          <div className="flex justify-end">
            <Button type="button" onClick={() => onApply(entry)}>
              Apply entry changes
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
