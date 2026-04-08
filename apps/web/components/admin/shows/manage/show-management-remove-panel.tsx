"use client";

import React from "react";
import { ConfirmModal } from "@web/components/ui/confirm-modal";
import { useI18n } from "@/hooks/i18n";
import type { PendingRemovalEntry } from "./show-management-types";

type ShowManagementRemovePanelProps = {
  pendingRemovalEntry: PendingRemovalEntry;
  onCancel: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
};

export function ShowManagementRemovePanel({
  pendingRemovalEntry,
  onCancel,
  onConfirm,
  isConfirming = false,
}: ShowManagementRemovePanelProps) {
  const { t } = useI18n();
  return (
    <ConfirmModal
      open={Boolean(pendingRemovalEntry)}
      title={t("admin.shows.manage.remove.title")}
      description={
        <>
          {pendingRemovalEntry?.dogName ??
            t("admin.shows.manage.remove.defaultDog")}{" "}
          {t("admin.shows.manage.remove.descriptionSuffix")}
        </>
      }
      confirmLabel={t("admin.shows.manage.remove.confirm")}
      cancelLabel={t("admin.shows.manage.remove.cancel")}
      confirmVariant="destructive"
      ariaLabel={t("admin.shows.manage.remove.aria")}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isConfirming={isConfirming}
      confirmingLabel={t("admin.shows.manage.remove.confirming")}
    />
  );
}
