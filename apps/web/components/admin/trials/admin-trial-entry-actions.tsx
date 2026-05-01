"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { getTrialPdfHref } from "@/lib/public/beagle/trials";

type AdminTrialEntryActionsProps = {
  trialId: string;
};

export function AdminTrialEntryActions({
  trialId,
}: AdminTrialEntryActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={getTrialPdfHref(trialId)} target="_blank" rel="noreferrer">
          {t("admin.trials.manage.selected.actions.openPdf")}
        </Link>
      </Button>
    </div>
  );
}
