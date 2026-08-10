"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import {
  getAdminTrialEntryCreateHref,
  getAdminTrialsHref,
} from "@/lib/admin/trials";
import { useAdminTrialEventQuery } from "@/queries/admin/trials";
import { AdminTrialSelectedEventPanel } from "./admin-trial-selected-event-panel";

type AdminTrialEventWorkspacePageClientProps = {
  trialEventId: string;
};

export function AdminTrialEventWorkspacePageClient({
  trialEventId,
}: AdminTrialEventWorkspacePageClientProps) {
  const { t } = useI18n();
  const router = useRouter();
  const eventQuery = useAdminTrialEventQuery({ trialEventId });
  const errorCode = eventQuery.error?.errorCode;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("admin.trials.manage.workspace.title")}
      </h1>

      {eventQuery.isError ? (
        <Card>
          <CardContent className="space-y-4 p-5">
            <p
              className={
                errorCode === "TRIAL_EVENT_NOT_FOUND"
                  ? "text-sm text-muted-foreground"
                  : "text-sm text-destructive"
              }
            >
              {t(
                errorCode === "TRIAL_EVENT_NOT_FOUND"
                  ? "admin.trials.manage.workspace.notFound"
                  : "admin.trials.manage.workspace.error",
              )}
            </p>
            {errorCode === "TRIAL_EVENT_NOT_FOUND" ? null : (
              <Button
                type="button"
                variant="outline"
                onClick={() => void eventQuery.refetch()}
              >
                {t("admin.trials.manage.workspace.retry")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <AdminTrialSelectedEventPanel
          selectedEvent={eventQuery.data?.event ?? null}
          isLoading={eventQuery.isLoading}
          isError={false}
          errorText={t("admin.trials.manage.workspace.error")}
          onDeletedTrialEvent={() => router.replace(getAdminTrialsHref())}
          onTrialEventDeleteConflict={() => void eventQuery.refetch()}
          allowEmptyEventDeletion
          createEntryHref={getAdminTrialEntryCreateHref(trialEventId)}
        />
      )}
    </div>
  );
}
