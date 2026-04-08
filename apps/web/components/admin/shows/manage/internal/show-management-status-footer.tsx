"use client";

import { useI18n } from "@/hooks/i18n";

export function ShowManagementStatusFooter({
  statusText,
}: {
  statusText: string;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {statusText || t("admin.shows.manage.status.noUnsavedChanges")}
      </p>
    </div>
  );
}
