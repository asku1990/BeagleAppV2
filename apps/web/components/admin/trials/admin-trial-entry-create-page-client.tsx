"use client";

import React from "react";
import type { AdminTrialEntryValidationIssue } from "@beagle/contracts";
import { useRouter } from "next/navigation";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import { useUnsavedTrialEntryGuard } from "@/hooks/admin/trials/manage/use-unsaved-trial-entry-guard";
import { formatDateForFinland } from "@/lib/admin/core/date";
import {
  areAdminTrialEntryCreateDraftsEqual,
  createAdminTrialEntryCreateDraft,
  createEmptyEraDraft,
  getAdminTrialEventHref,
  getAdminTrialsHref,
  getNextEraNumber,
  toCreateAdminTrialEntryRequest,
} from "@/lib/admin/trials";
import {
  useAdminTrialEventQuery,
  useCreateAdminTrialEntryMutation,
} from "@/queries/admin/trials";
import { EntryMetaSection } from "./internal/entry-meta-section";
import { EraSection } from "./internal/era-section";
import { LisatiedotMatrix } from "./internal/lisatiedot-matrix";

type SaveIntent = "another" | "finish";

export function AdminTrialEntryCreatePageClient({
  trialEventId,
}: {
  trialEventId: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const eventQuery = useAdminTrialEventQuery({ trialEventId });
  const event = eventQuery.data?.event;

  if (eventQuery.isLoading)
    return <p>{t("admin.trials.manage.resultCreate.loading")}</p>;
  if (eventQuery.isError || !event) {
    const missing = eventQuery.error?.errorCode === "TRIAL_EVENT_NOT_FOUND";
    return (
      <StateCard
        message={t(
          missing
            ? "admin.trials.manage.resultCreate.eventNotFound"
            : "admin.trials.manage.resultCreate.loadError",
        )}
        action={
          missing
            ? () => router.replace(getAdminTrialsHref())
            : () => void eventQuery.refetch()
        }
        actionLabel={t(
          missing
            ? "admin.trials.manage.resultCreate.backToList"
            : "admin.trials.manage.workspace.retry",
        )}
      />
    );
  }
  if (event.sklKoeId === null) {
    return (
      <StateCard
        message={t("admin.trials.manage.resultCreate.missingSklId")}
        action={() => router.replace(getAdminTrialEventHref(trialEventId))}
        actionLabel={t("admin.trials.manage.resultCreate.backToWorkspace")}
      />
    );
  }
  return (
    <ResultCreateForm
      key={`${event.trialEventId}:${event.ylituomari ?? ""}:${event.ylituomariNumero ?? ""}`}
      event={event}
    />
  );
}

function StateCard({
  message,
  action,
  actionLabel,
}: {
  message: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" onClick={action}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

function ResultCreateForm({
  event,
}: {
  event: NonNullable<
    ReturnType<typeof useAdminTrialEventQuery>["data"]
  >["event"];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const mutation = useCreateAdminTrialEntryMutation();
  const initial = React.useMemo(
    () => createAdminTrialEntryCreateDraft(event),
    [event],
  );
  const [draft, setDraft] = React.useState(initial);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const submittingRef = React.useRef(false);
  const dirty = !areAdminTrialEntryCreateDraftsEqual(initial, draft);
  const guard = useUnsavedTrialEntryGuard(dirty);
  const workspaceHref = getAdminTrialEventHref(event.trialEventId);

  function addEra() {
    const era = getNextEraNumber(draft.eras);
    setDraft((current) => ({
      ...current,
      eras: [...current.eras, createEmptyEraDraft(era)],
      lisatiedotRows: current.lisatiedotRows.map((row) => ({
        ...row,
        eraValues: { ...row.eraValues, [era]: "" },
      })),
    }));
  }
  function removeEra(era: number) {
    if (era === 1) return;
    setDraft((current) => ({
      ...current,
      eras: current.eras.filter((item) => item.era !== era),
      lisatiedotRows: current.lisatiedotRows.map((row) => {
        const values = { ...row.eraValues };
        delete values[era];
        return { ...row, eraValues: values };
      }),
    }));
  }
  async function submit(intent: SaveIntent) {
    if (submittingRef.current || mutation.isPending) return;
    setErrorText(null);
    const parsed = toCreateAdminTrialEntryRequest(event.trialEventId, draft);
    if (!parsed.ok) {
      setErrorText(
        t(
          `admin.trials.manage.resultCreate.validation.${parsed.section}` as never,
        ),
      );
      return;
    }
    submittingRef.current = true;
    try {
      await mutation.mutateAsync(parsed.request);
      toast.success(t("admin.trials.manage.resultCreate.success"));
      if (intent === "another")
        setDraft(createAdminTrialEntryCreateDraft(event));
      else router.replace(workspaceHref);
    } catch (error) {
      const code =
        error instanceof AdminMutationError ? error.errorCode : undefined;
      if (code === "UNAUTHENTICATED" || code === "FORBIDDEN") {
        router.refresh();
        return;
      }
      const map: Record<string, string> = {
        INVALID_REGISTRATION_NUMBER: "registration",
        TRIAL_ENTRY_REGISTRATION_CONFLICT: "conflict",
        INVALID_TRIAL_ENTRY: "entry",
        INVALID_TRIAL_ERAS: "eras",
        INVALID_TRIAL_ADDITIONAL_INFO: "additionalInfo",
        TRIAL_EVENT_NOT_FOUND: "eventNotFound",
        TRIAL_EVENT_MISSING_SKL_ID: "missingSklId",
      };
      const issue =
        error instanceof AdminMutationError
          ? (error.details as AdminTrialEntryValidationIssue | undefined)
          : undefined;
      if (issue?.area === "additional_info" && issue.koodi) {
        const row = `${issue.koodi}${issue.osa ? issue.osa : ""}`;
        const issueKey =
          issue.reason === "invalid_lisatieto_order"
            ? "admin.trials.manage.resultCreate.error.additionalInfoOrder"
            : "admin.trials.manage.resultCreate.error.additionalInfoRow";
        setErrorText(`${t(issueKey)}: ${row}.`);
      } else {
        setErrorText(
          t(
            `admin.trials.manage.resultCreate.error.${map[code ?? ""] ?? "generic"}` as never,
          ),
        );
      }
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("admin.trials.manage.resultCreate.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDateForFinland(event.eventDate)} • {event.eventPlace} • SKL{" "}
          {event.sklKoeId}
        </p>
      </div>
      <Card>
        <CardContent className="space-y-5 p-5">
          {errorText ? (
            <p className="text-sm text-destructive" role="alert">
              {errorText}
            </p>
          ) : null}
          <label className="block space-y-1 text-sm">
            <span>{t("admin.trials.manage.resultCreate.registration")}</span>
            <Input
              value={draft.registrationNo}
              disabled={mutation.isPending}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  registrationNo: e.target.value,
                }))
              }
            />
          </label>
          <EntryMetaSection
            entryDraft={draft.entry}
            isPending={mutation.isPending}
            onChange={(update) =>
              setDraft((current) => ({
                ...current,
                entry: update(current.entry),
              }))
            }
          />
          <EraSection
            eras={draft.eras}
            isPending={mutation.isPending}
            onAddEra={addEra}
            onRemoveEra={removeEra}
            onChangeEraField={(era, field, value) =>
              setDraft((current) => ({
                ...current,
                eras: current.eras.map((item) =>
                  item.era === era ? { ...item, [field]: value } : item,
                ),
              }))
            }
          />
          <LisatiedotMatrix
            eras={draft.eras}
            rows={draft.lisatiedotRows}
            isPending={mutation.isPending}
            onChangeCell={(koodi, osa, era, value) =>
              setDraft((current) => ({
                ...current,
                lisatiedotRows: current.lisatiedotRows.map((row) =>
                  row.koodi === koodi && row.osa === osa
                    ? { ...row, eraValues: { ...row.eraValues, [era]: value } }
                    : row,
                ),
              }))
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={mutation.isPending}
              onClick={() => void submit("another")}
            >
              {t("admin.trials.manage.resultCreate.saveAnother")}
            </Button>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => void submit("finish")}
            >
              {t("admin.trials.manage.resultCreate.saveFinish")}
            </Button>
            <Button
              variant="ghost"
              disabled={mutation.isPending}
              onClick={() =>
                guard.requestLeave(() => router.replace(workspaceHref))
              }
            >
              {t("admin.trials.manage.resultCreate.cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmModal
        open={guard.isConfirmingLeave}
        title={t("admin.trials.manage.resultCreate.unsaved.title")}
        description={t("admin.trials.manage.resultCreate.unsaved.body")}
        confirmLabel={t("admin.trials.manage.resultCreate.unsaved.confirm")}
        cancelLabel={t("admin.trials.manage.resultCreate.unsaved.cancel")}
        confirmVariant="default"
        onConfirm={guard.confirmLeave}
        onCancel={guard.cancelLeave}
      />
    </div>
  );
}
