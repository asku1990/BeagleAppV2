"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { getTrialPdfHref } from "@/lib/public/beagle/trials";

type AdminTrialEntryActionsProps = {
  trialId: string;
  onOpenTrialDetail: (trialId: string) => void;
};

export function AdminTrialEntryActions({
  trialId,
  onOpenTrialDetail,
}: AdminTrialEntryActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onOpenTrialDetail(trialId)}
      >
        {t("admin.trials.manage.selected.actions.openDetail")}
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={getTrialPdfHref(trialId)} target="_blank" rel="noreferrer">
          {t("admin.trials.manage.selected.actions.openPdf")}
        </Link>
      </Button>
    </div>
  );
}
