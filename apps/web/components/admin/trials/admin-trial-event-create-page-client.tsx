"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import {
  getAdminTrialsHref,
  submitAdminTrialEventCreation,
} from "@/lib/admin/trials";
import { useCreateAdminTrialEventMutation } from "@/queries/admin/trials";
import { createEmptyTrialEventDraft } from "./admin-trial-event-edit-dialog-helpers";
import { AdminTrialEventFormFields } from "./admin-trial-event-form-fields";

// Renders and submits the full-page manual trial event creation flow.
export function AdminTrialEventCreatePageClient({
  initialEventDate,
}: {
  initialEventDate: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const createMutation = useCreateAdminTrialEventMutation();
  const [draft, setDraft] = useState(() => ({
    ...createEmptyTrialEventDraft(),
    eventDate: initialEventDate,
  }));
  const [errorText, setErrorText] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.trials.manage.create.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.trials.manage.create.description")}
        </p>
      </div>
      <Card>
        <CardContent className="p-5">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitAdminTrialEventCreation({
                draft,
                isPending: createMutation.isPending,
                mutateAsync: createMutation.mutateAsync,
                replace: router.replace,
                setErrorText,
                t,
              });
            }}
          >
            {errorText ? (
              <p className="text-sm text-destructive">{errorText}</p>
            ) : null}
            <AdminTrialEventFormFields
              draft={draft}
              disabled={createMutation.isPending}
              onChange={setDraft}
              requireSklKoeId
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? t("admin.trials.manage.create.saving")
                  : t("admin.trials.manage.create.save")}
              </Button>
              <Button asChild variant="outline">
                <Link href={getAdminTrialsHref()}>
                  {t("admin.trials.manage.create.cancel")}
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
