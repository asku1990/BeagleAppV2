"use client";

import Link from "next/link";
import { AdminRowActionsMenu } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { getTrialPdfHref } from "@/lib/public/beagle/trials";
import { useDeleteAdminTrialEntryMutation } from "@/queries/admin/trials";

type AdminTrialEntryActionsProps = {
  trialEventId: string;
  trialEntryId: string;
  trialId: string;
  dogName: string;
  registrationNo: string | null;
  eventDate: string;
  eventPlace: string;
  eventName: string | null;
  onEditEntry: () => void;
  onDeletedTrialEvent: (deletedTrialEventId: string) => void;
};

export function AdminTrialEntryActions({
  trialEventId,
  trialEntryId,
  trialId,
  dogName,
  registrationNo,
  eventDate,
  eventPlace,
  eventName,
  onEditEntry,
  onDeletedTrialEvent,
}: AdminTrialEntryActionsProps) {
  const { t } = useI18n();
  const deleteMutation = useDeleteAdminTrialEntryMutation();

  async function handleDelete() {
    const resolvedDogName = dogName.trim() || "-";
    const resolvedRegistrationNo = registrationNo?.trim() || "-";
    const eventDateLabel = formatDateForFinland(eventDate);
    const eventPlaceLabel = eventPlace.trim() || "-";
    const eventNameLabel = eventName?.trim() || null;
    const confirmed = window.confirm(
      `${t("admin.trials.manage.selected.actions.delete.confirmTitle")}\n\n` +
        `${t("admin.trials.manage.selected.actions.delete.confirmBody")}\n\n` +
        `${t("admin.trials.manage.selected.actions.delete.confirmDog")}: ${resolvedDogName}\n` +
        `${t("admin.trials.manage.selected.actions.delete.confirmRegistration")}: ${resolvedRegistrationNo}\n` +
        `${t("admin.trials.manage.selected.actions.delete.confirmEvent")}: ${eventDateLabel} • ${eventPlaceLabel}${eventNameLabel ? ` • ${eventNameLabel}` : ""}`,
    );
    if (!confirmed || deleteMutation.isPending) {
      return;
    }

    try {
      const result = await deleteMutation.mutateAsync({
        trialEventId,
        trialEntryId,
      });
      if (result.deletedTrialEvent) {
        onDeletedTrialEvent(result.trialEventId);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("admin.trials.manage.selected.error");
      window.alert(message);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="icon-xs">
        <Link href={getTrialPdfHref(trialId)} target="_blank" rel="noreferrer">
          <FileText className="size-3.5" aria-hidden="true" />
          <span className="sr-only">
            {t("admin.trials.manage.selected.actions.openPdf")}
          </span>
        </Link>
      </Button>
      <AdminRowActionsMenu
        triggerAriaLabel={t("admin.trials.manage.selected.actions.more")}
        actions={[
          {
            id: "edit-trial-entry",
            label: t("admin.trials.manage.selected.actions.editEntry"),
            onSelect: onEditEntry,
            disabled: deleteMutation.isPending,
          },
          {
            id: "delete-trial-entry",
            label: t("admin.trials.manage.selected.actions.delete"),
            onSelect: () => {
              void handleDelete();
            },
            destructive: true,
            disabled: deleteMutation.isPending,
          },
        ]}
      />
    </div>
  );
}
