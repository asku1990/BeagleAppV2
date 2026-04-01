"use client";

import React from "react";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import type {
  ManageShowEditOptions,
  ManageShowAward,
  ManageShowEntry,
} from "./show-management-types";

type ShowManagementEntryCardProps = {
  entry: ManageShowEntry;
  resultOptions: ManageShowEditOptions;
  isDirty: boolean;
  onEntryFieldChange: (
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) => void;
  onAddAward: (entryId: string, award: string) => void;
  onRemoveAward: (entryId: string, awardId: string) => void;
  onRemove: (entry: ManageShowEntry) => void;
  onApply: (entry: ManageShowEntry) => void;
};

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
  values: ManageShowAward[],
): ManageShowEditOptions["awardOptions"] {
  const knownValues = new Set(options.map((option) => option.value));
  const missingOptions = values
    .map((award) => award.code.trim())
    .filter((value) => value.length > 0)
    .filter((value) => !knownValues.has(value))
    .map((value) => ({
      value,
      label: `${value} - Unknown current value`,
    }));

  return [...options, ...missingOptions];
}

function createOptionLabelLookup(
  options: Array<{ value: string; label: string }>,
): Map<string, string> {
  return new Map(
    options.map((option) => [option.value.trim(), option.label.trim()]),
  );
}

function resolveOptionLabel(
  lookup: Map<string, string>,
  value: string,
): string {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return "-";
  }

  return (
    lookup.get(normalizedValue) ?? `${normalizedValue} - Unknown current value`
  );
}

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

export function ShowManagementEntryCard({
  entry,
  resultOptions,
  isDirty,
  onEntryFieldChange,
  onAddAward,
  onRemoveAward,
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
  const awardOptions = getMissingAwardOptions(
    resultOptions.awardOptions,
    entry.awards,
  );
  const availableAwardOptions = awardOptions.filter(
    (option) =>
      !entry.awards.some((award) => award.code.trim() === option.value.trim()),
  );
  const awardsDisabled = awardOptions.length === 0;
  const classLabelLookup = createOptionLabelLookup(classOptions);
  const qualityLabelLookup = createOptionLabelLookup(qualityOptions);
  const awardLabelLookup = createOptionLabelLookup(awardOptions);
  const pupnLabelLookup = createOptionLabelLookup(resultOptions.pupnOptions);
  const selectedAwardsText =
    entry.awards.length > 0
      ? entry.awards
          .map((award) => resolveOptionLabel(awardLabelLookup, award.code))
          .join(", ")
      : "-";
  const selectedClassText = resolveOptionLabel(
    classLabelLookup,
    entry.classCode,
  );
  const selectedPlacementText = entry.classPlacement.trim();
  const selectedClassResultText =
    selectedClassText === "-"
      ? "-"
      : selectedPlacementText
        ? `${selectedClassText} ${selectedPlacementText}`
        : selectedClassText;
  const selectedQualityText = resolveOptionLabel(
    qualityLabelLookup,
    entry.qualityGrade,
  );
  const selectedPupnText = entry.pupn.trim()
    ? resolveOptionLabel(pupnLabelLookup, entry.pupn)
    : "-";
  const pupnParts = getPupnParts(entry.pupn);
  const pupnPrefix = pupnParts.prefix;

  console.info("[show-manage][entry-card][render]", {
    entryId: entry.id,
    dogName: entry.dogName,
    awards: entry.awards.map((award) => ({
      awardId: award.id,
      awardCode: award.code,
      awardLabel: resolveOptionLabel(awardLabelLookup, award.code),
    })),
  });

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
                onEntryFieldChange(entry.id, "judge", event.target.value)
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
          <label className="block space-y-1 text-sm">
            <span>Class</span>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
              <select
                value={entry.classCode}
                onChange={(event) =>
                  onEntryFieldChange(entry.id, "classCode", event.target.value)
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
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={entry.classPlacement}
                onChange={(event) =>
                  onEntryFieldChange(
                    entry.id,
                    "classPlacement",
                    event.target.value,
                  )
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
                disabled={pupnPrefix === "-"}
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
          <div className="space-y-1 text-sm">
            <span className="block">Awards</span>
            <div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
              {entry.awards.length === 0 ? (
                <span className="text-xs text-muted-foreground">-</span>
              ) : (
                entry.awards.map((award) => (
                  <span
                    key={award.id}
                    className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                  >
                    <span>
                      {resolveOptionLabel(awardLabelLookup, award.code)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove award ${award.code}`}
                      onClick={() => {
                        console.info(
                          "[show-manage][entry-card][remove-award-click]",
                          {
                            entryId: entry.id,
                            dogName: entry.dogName,
                            awardId: award.id,
                            awardCode: award.code,
                            awardLabel: resolveOptionLabel(
                              awardLabelLookup,
                              award.code,
                            ),
                            awardsBefore: entry.awards.map((currentAward) => ({
                              awardId: currentAward.id,
                              awardCode: currentAward.code,
                            })),
                          },
                        );
                        onRemoveAward(entry.id, award.id);
                      }}
                      className="hover:bg-muted-foreground/10 rounded-full px-1 leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            <select
              value=""
              onChange={(event) => {
                if (!event.target.value) {
                  return;
                }
                console.info("[show-manage][entry-card][add-award-click]", {
                  entryId: entry.id,
                  dogName: entry.dogName,
                  awardCode: event.target.value,
                  awardLabel:
                    awardLabelLookup.get(event.target.value.trim()) ??
                    event.target.value,
                  awardsBefore: entry.awards.map((award) => ({
                    awardId: award.id,
                    awardCode: award.code,
                  })),
                });
                onAddAward(entry.id, event.target.value);
              }}
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
              Selected awards appear as badges. Use the `x` to remove one.
            </p>
          </div>
          <label className="space-y-1 text-sm md:col-span-2">
            <span>Critique</span>
            <textarea
              value={entry.critiqueText}
              onChange={(event) =>
                onEntryFieldChange(entry.id, "critiqueText", event.target.value)
              }
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
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
