"use client";

import React from "react";
import type { AdminShowResultOption } from "@beagle/contracts";
import { useI18n } from "@/hooks/i18n";
import type {
  ManageShowAward,
  ManageShowEntry,
} from "../show-management-types";

type ShowManagementAwardsEditorProps = {
  entry: ManageShowEntry;
  availableAwardOptions: AdminShowResultOption[];
  awardsDisabled: boolean;
  isDisabled?: boolean;
  onAddAward: (entryId: string, awardCode: string) => void;
  onRemoveAward: (entryId: string, awardId: string) => void;
  resolveAwardLabel: (value: string) => string;
};

export function ShowManagementAwardsEditor({
  entry,
  availableAwardOptions,
  awardsDisabled,
  isDisabled = false,
  onAddAward,
  onRemoveAward,
  resolveAwardLabel,
}: ShowManagementAwardsEditorProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-1 text-sm">
      <span className="block">{t("admin.shows.manage.awards.label")}</span>
      <div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
        {entry.awards.length === 0 ? (
          <span className="text-xs text-muted-foreground">-</span>
        ) : (
          entry.awards.map((award) => (
            <AwardChip
              key={award.id}
              entry={entry}
              award={award}
              isDisabled={isDisabled}
              onRemoveAward={onRemoveAward}
              resolveAwardLabel={resolveAwardLabel}
            />
          ))
        )}
      </div>
      <select
        value=""
        onChange={(event) => {
          if (!event.target.value) {
            return;
          }
          onAddAward(entry.id, event.target.value);
        }}
        disabled={
          isDisabled || awardsDisabled || availableAwardOptions.length === 0
        }
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
        {t("admin.shows.manage.awards.help")}
      </p>
    </div>
  );
}

function AwardChip({
  entry,
  award,
  isDisabled,
  onRemoveAward,
  resolveAwardLabel,
}: {
  entry: ManageShowEntry;
  award: ManageShowAward;
  isDisabled: boolean;
  onRemoveAward: (entryId: string, awardId: string) => void;
  resolveAwardLabel: (value: string) => string;
}) {
  const { t } = useI18n();

  return (
    <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
      <span>{resolveAwardLabel(award.code)}</span>
      <button
        type="button"
        aria-label={`${t("admin.shows.manage.awards.removeAriaPrefix")} ${award.code}`}
        disabled={isDisabled}
        onClick={() => onRemoveAward(entry.id, award.id)}
        className="hover:bg-muted-foreground/10 rounded-full px-1 leading-none"
      >
        ×
      </button>
    </span>
  );
}
