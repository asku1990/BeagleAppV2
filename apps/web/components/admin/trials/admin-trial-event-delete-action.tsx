"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { useDeleteAdminTrialEventMutation } from "@/queries/admin/trials";

type AdminTrialEventDeleteActionProps = {
  trialEventId: string;
  onDeleted: (deletedTrialEventId: string) => void;
  onNotEmpty: () => void;
};

// Coordinates confirmation, mutation feedback, and workspace callbacks for empty-event deletion.
export function AdminTrialEventDeleteAction({
  trialEventId,
  onDeleted,
  onNotEmpty,
}: AdminTrialEventDeleteActionProps) {
  const { t } = useI18n();
  const deleteMutation = useDeleteAdminTrialEventMutation();
  const [isOpen, setIsOpen] = useState(false);

  async function handleDelete() {
    try {
      const result = await deleteMutation.mutateAsync({ trialEventId });
      toast.success(t("admin.trials.manage.deleteEvent.success"));
      setIsOpen(false);
      onDeleted(result.deletedTrialEventId);
    } catch (error) {
      if (
        error instanceof AdminMutationError &&
        error.errorCode === "TRIAL_EVENT_NOT_EMPTY"
      ) {
        onNotEmpty();
      }
      toast.error(
        error instanceof AdminMutationError
          ? error.errorCode === "TRIAL_EVENT_NOT_EMPTY"
            ? t("admin.trials.manage.deleteEvent.notEmpty")
            : error.message
          : t("admin.trials.manage.deleteEvent.error"),
      );
    }
  }

  return (
    <>
      <div className="space-y-1">
        <Button
          type="button"
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={() => setIsOpen(true)}
        >
          {t("admin.trials.manage.deleteEvent.action")}
        </Button>
      </div>
      <ConfirmModal
        open={isOpen}
        title={t("admin.trials.manage.deleteEvent.confirmTitle")}
        description={t("admin.trials.manage.deleteEvent.confirmBody")}
        confirmLabel={t("admin.trials.manage.deleteEvent.confirm")}
        confirmingLabel={t("admin.trials.manage.deleteEvent.deleting")}
        cancelLabel={t("admin.trials.manage.deleteEvent.cancel")}
        isConfirming={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleteMutation.isPending) setIsOpen(false);
        }}
      />
    </>
  );
}
