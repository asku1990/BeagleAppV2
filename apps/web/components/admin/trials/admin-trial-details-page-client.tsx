"use client";
import React from "react";
import { ListingSectionShell } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import {
  isAdminTrialQueryError,
  useAdminTrialQuery,
} from "@/queries/admin/trials";
import { AdminTrialValidationPanel } from "./admin-trial-validation-panel";

function showDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : "-";
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("fi-FI", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fi-FI", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}:</span> {value}
    </p>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-sm font-semibold">{children}</h3>;
}

type AdminTrialDetailsPageClientProps = {
  trialId: string;
};

export function AdminTrialDetailsPageClient({
  trialId,
}: AdminTrialDetailsPageClientProps) {
  const { t } = useI18n();
  const normalizedTrialId = trialId.trim();
  const trialQuery = useAdminTrialQuery({
    trialId: normalizedTrialId,
    enabled: normalizedTrialId.length > 0,
  });

  const trial = trialQuery.data?.trial;
  const isNotFoundError =
    isAdminTrialQueryError(trialQuery.error) &&
    trialQuery.error.errorCode === "TRIAL_NOT_FOUND";
  const detailErrorMessage =
    trialQuery.error instanceof Error
      ? trialQuery.error.message
      : t("admin.trials.detail.state.error");

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.trials.detail.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {trial
            ? `${formatDateForFinland(trial.eventDate)} • ${showDash(trial.eventPlace)}`
            : t("admin.trials.detail.header.placeholder")}
        </p>
      </div>

      <ListingSectionShell
        title={t("admin.trials.detail.section.title")}
        subtitle={t("admin.trials.detail.section.subtitle")}
      >
        <div className="space-y-4">
          {!normalizedTrialId ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {t("admin.trials.detail.state.invalid")}
              </CardContent>
            </Card>
          ) : trialQuery.isLoading ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.trials.detail.state.loading")}
              </CardContent>
            </Card>
          ) : trialQuery.isError && isNotFoundError ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.trials.detail.state.notFound")}
              </CardContent>
            </Card>
          ) : trialQuery.isError ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {detailErrorMessage}
              </CardContent>
            </Card>
          ) : !trial ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.trials.detail.state.notFound")}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.trialInfo")}
                  </SectionTitle>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow
                      label={t("admin.trials.detail.fields.eventDate")}
                      value={formatDateForFinland(trial.eventDate)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.eventPlace")}
                      value={showDash(trial.eventPlace)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.eventName")}
                      value={showDash(trial.eventName)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.kennelDistrict")}
                      value={showDash(trial.kennelDistrict)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.kennelDistrictNo")}
                      value={showDash(trial.kennelDistrictNo)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.judge")}
                      value={showDash(trial.ylituomariNimi)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.ke")}
                      value={showDash(trial.keli)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.dogInfo")}
                  </SectionTitle>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow
                      label={t("admin.trials.detail.fields.dogName")}
                      value={showDash(trial.dogName)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.registrationNo")}
                      value={showDash(trial.registrationNo)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.dogId")}
                      value={showDash(trial.dogId)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.resultSummary")}
                  </SectionTitle>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow
                      label={t("admin.trials.detail.fields.lk")}
                      value={showDash(trial.luokka)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.pa")}
                      value={showDash(trial.palkinto)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.sija")}
                      value={showDash(trial.sijoitus)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.piste")}
                      value={formatNumber(trial.loppupisteet)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.scoreBreakdown")}
                  </SectionTitle>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow
                      label={t("admin.trials.detail.fields.haku")}
                      value={formatNumber(trial.hakuKeskiarvo)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.hauk")}
                      value={formatNumber(trial.haukkuKeskiarvo)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.yva")}
                      value={formatNumber(trial.yleisvaikutelmaPisteet)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.hlo")}
                      value={formatNumber(trial.hakuloysyysTappioYhteensa)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.alo")}
                      value={formatNumber(trial.ajoloysyysTappioYhteensa)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.tja")}
                      value={formatNumber(trial.tieJaEstetyoskentelyPisteet)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.pin")}
                      value={formatNumber(trial.metsastysintoPisteet)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.metadata")}
                  </SectionTitle>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow
                      label={t("admin.trials.detail.fields.trialId")}
                      value={showDash(trial.trialId)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.sklKoeId")}
                      value={showDash(trial.sklKoeId)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.entryKey")}
                      value={showDash(trial.entryKey)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.legacyFlag")}
                      value={showDash(trial.notes)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.createdAt")}
                      value={formatTimestamp(trial.createdAt)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.updatedAt")}
                      value={formatTimestamp(trial.updatedAt)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.raw")}
                  </SectionTitle>
                  <details>
                    <summary className="cursor-pointer text-sm underline-offset-2 hover:underline">
                      {t("admin.trials.detail.raw.toggle")}
                    </summary>
                    <div className="mt-3">
                      {trial.rawPayloadAvailable && trial.rawPayloadJson ? (
                        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                          {trial.rawPayloadJson}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("admin.trials.detail.raw.unavailable")}
                        </p>
                      )}
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          )}

          <AdminTrialValidationPanel
            context="detail"
            trial={!trialQuery.isError && !trialQuery.isLoading ? trial : null}
          />
        </div>
      </ListingSectionShell>
    </div>
  );
}
