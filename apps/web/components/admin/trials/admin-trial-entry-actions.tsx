"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { getTrialPdfHref } from "@/lib/public/beagle/trials";
import { useDeleteAdminTrialEntryMutation } from "@/queries/admin/trials";

type AdminTrialEntryActionsProps = {
  trialEventId: string;
  trialEntryId: string;
  trialId: string;
  dogName: string;
  registrationNo: string | null;
  onDeletedTrialEvent: () => void;
};

export function AdminTrialEntryActions({
  trialEventId,
  trialEntryId,
  trialId,
  dogName,
  registrationNo,
  onDeletedTrialEvent,
}: AdminTrialEntryActionsProps) {
  const { t } = useI18n();
  const deleteMutation = useDeleteAdminTrialEntryMutation();

  async function handleDelete() {
    const label = dogName.trim() || registrationNo || trialEntryId;
    const confirmed = window.confirm(
      `${t("admin.trials.manage.selected.actions.delete.confirmTitle")}\n\n` +
        `${t("admin.trials.manage.selected.actions.delete.confirmBody")}\n\n` +
        `${label}`,
    );
    if (!confirmed || deleteMutation.isPending) {
      return;
    }

    const result = await deleteMutation.mutateAsync({
      trialEventId,
      trialEntryId,
    });
    if (result.deletedTrialEvent) {
      onDeletedTrialEvent();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={getTrialPdfHref(trialId)} target="_blank" rel="noreferrer">
          {t("admin.trials.manage.selected.actions.openPdf")}
        </Link>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => {
          void handleDelete();
        }}
        disabled={deleteMutation.isPending}
      >
        {t("admin.trials.manage.selected.actions.delete")}
      </Button>
    </div>
  );
}
