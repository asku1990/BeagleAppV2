"use client";

import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import {
  areShowEntriesEqual,
  cloneManageShowEntry,
  buildEntryDisplayState,
  resolveOptionLabel,
} from "@/lib/admin/shows/manage";
import { useModalDraftState } from "@/hooks/admin/shows/manage/use-modal-draft-state";
import { ShowManagementAwardsEditor } from "./internal/show-management-awards-editor";
import { ShowManagementCritiqueField } from "./internal/show-management-critique-field";
import { ShowManagementResultFieldsGrid } from "./internal/show-management-result-fields-grid";
import type {
  ManageShowEditOptions,
  ManageShowEntry,
} from "./show-management-types";

export function ShowManagementEntryModal({
  open,
  entry,
  resultOptions,
  isApplying,
  onClose,
  onApplyEntry,
}: {
  open: boolean;
  entry: ManageShowEntry;
  resultOptions: ManageShowEditOptions;
  isApplying: boolean;
  onClose: () => void;
  onApplyEntry: (entry: ManageShowEntry) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const { draft: draftEntry, setDraft: setDraftEntry } = useModalDraftState(
    () => cloneManageShowEntry(entry),
  );
  const displayState = buildEntryDisplayState(draftEntry, resultOptions);
  const isDirty = !areShowEntriesEqual(draftEntry, entry);
  const optionsUnavailable =
    resultOptions.classOptions.length === 0 &&
    resultOptions.qualityOptions.length === 0 &&
    resultOptions.awardOptions.length === 0 &&
    resultOptions.pupnOptions.length === 0;
  const resolveAwardLabel = (value: string) =>
    resolveOptionLabel(displayState.awardLabelLookup, value);

  return (
    <AdminFormModalShell
      open={open}
      onClose={onClose}
      title={entry.dogName}
      ariaLabel={t("admin.shows.manage.entryModal.aria")}
      contentClassName="max-h-[90vh] max-w-3xl overflow-y-auto"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("admin.shows.manage.entryModal.close")}
          </Button>
          <Button
            type="button"
            onClick={() =>
              void (async () => {
                if (await onApplyEntry(draftEntry)) {
                  onClose();
                }
              })()
            }
            disabled={isApplying || !isDirty}
          >
            {isApplying
              ? t("admin.shows.manage.entryModal.saving")
              : t("admin.shows.manage.entryModal.save")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{entry.registrationNo}</p>
      <p
        className={
          entry.dogId
            ? "text-xs text-muted-foreground"
            : "text-xs text-amber-700"
        }
      >
        {entry.dogId
          ? t("admin.shows.manage.entryModal.linked")
          : t("admin.shows.manage.entryModal.snapshot")}
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <ShowManagementResultFieldsGrid
          entry={draftEntry}
          classOptions={displayState.classOptions}
          qualityOptions={displayState.qualityOptions}
          isDisabled={isApplying}
          onEntryFieldChange={(_, field, value) =>
            setDraftEntry((current) => ({ ...current, [field]: value }))
          }
        />

        <ShowManagementAwardsEditor
          entry={draftEntry}
          availableAwardOptions={displayState.availableAwardOptions}
          awardsDisabled={displayState.awardsDisabled}
          isDisabled={isApplying}
          onAddAward={(_, awardCode) =>
            setDraftEntry((current) => {
              const normalizedAwardCode = awardCode.trim();
              if (!normalizedAwardCode) {
                return current;
              }

              if (
                current.awards.some(
                  (award) => award.code === normalizedAwardCode,
                )
              ) {
                return current;
              }

              return {
                ...current,
                awards: [
                  ...current.awards,
                  {
                    id: `${current.id}:${normalizedAwardCode}`,
                    code: normalizedAwardCode,
                  },
                ],
              };
            })
          }
          onRemoveAward={(_, awardId) =>
            setDraftEntry((current) => ({
              ...current,
              awards: current.awards.filter((award) => award.id !== awardId),
            }))
          }
          resolveAwardLabel={resolveAwardLabel}
        />

        <ShowManagementCritiqueField
          entry={draftEntry}
          isDisabled={isApplying}
          onEntryFieldChange={(_, field, value) =>
            setDraftEntry((current) => ({ ...current, [field]: value }))
          }
        />
      </div>

      {optionsUnavailable ? (
        <p className="text-xs text-destructive">
          {t("admin.shows.manage.entryModal.optionsUnavailable")}
        </p>
      ) : null}
    </AdminFormModalShell>
  );
}
