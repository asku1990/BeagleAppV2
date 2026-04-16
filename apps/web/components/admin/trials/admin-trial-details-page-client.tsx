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

function showDash(value: string | number | boolean | null | undefined): string {
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

type LisatietoRow = {
  koodi: string;
  nimi: string;
  era1Arvo: string | null;
  era2Arvo: string | null;
  era3Arvo: string | null;
  era4Arvo: string | null;
  jarjestys: number;
};

function parseLisatiedotRows(
  rawLisatiedotJson: string | null | undefined,
): LisatietoRow[] {
  if (!rawLisatiedotJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawLisatiedotJson);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is LisatietoRow => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const candidate = item as Partial<LisatietoRow>;
      return (
        typeof candidate.koodi === "string" &&
        typeof candidate.nimi === "string" &&
        (candidate.era1Arvo === null ||
          typeof candidate.era1Arvo === "string") &&
        (candidate.era2Arvo === null ||
          typeof candidate.era2Arvo === "string") &&
        (candidate.era3Arvo === null ||
          typeof candidate.era3Arvo === "string") &&
        (candidate.era4Arvo === null ||
          typeof candidate.era4Arvo === "string") &&
        typeof candidate.jarjestys === "number"
      );
    });
  } catch {
    return [];
  }
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
  const lisatiedotRows = parseLisatiedotRows(trial?.lisatiedotJson);
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
                      label={t("admin.trials.detail.fields.rotukoodi")}
                      value={showDash(trial.rotukoodi)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.jarjestaja")}
                      value={showDash(trial.jarjestaja)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.koemuoto")}
                      value={showDash(trial.koemuoto)}
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
                      label={t("admin.trials.detail.fields.ylituomariNumero")}
                      value={showDash(trial.ylituomariNumero)}
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
                    <FieldRow
                      label={t("admin.trials.detail.fields.isanNimi")}
                      value={showDash(trial.isanNimi)}
                    />
                    <FieldRow
                      label={t(
                        "admin.trials.detail.fields.isanRekisterinumero",
                      )}
                      value={showDash(trial.isanRekisterinumero)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.emanNimi")}
                      value={showDash(trial.emanNimi)}
                    />
                    <FieldRow
                      label={t(
                        "admin.trials.detail.fields.emanRekisterinumero",
                      )}
                      value={showDash(trial.emanRekisterinumero)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.omistaja")}
                      value={showDash(trial.omistaja)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.omistajanKotikunta")}
                      value={showDash(trial.omistajanKotikunta)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.sukupuoli")}
                      value={showDash(trial.sukupuoli)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.rokotusOk")}
                      value={showDash(trial.rokotusOk)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.tunnistusOk")}
                      value={showDash(trial.tunnistusOk)}
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
                    <FieldRow
                      label={t("admin.trials.detail.fields.koiriaLuokassa")}
                      value={formatNumber(trial.koiriaLuokassa)}
                    />
                    <FieldRow
                      label={t(
                        "admin.trials.detail.fields.ansiopisteetYhteensa",
                      )}
                      value={formatNumber(trial.ansiopisteetYhteensa)}
                    />
                    <FieldRow
                      label={t(
                        "admin.trials.detail.fields.hyvaksytytAjominuutit",
                      )}
                      value={formatNumber(trial.hyvaksytytAjominuutit)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.ajoajanPisteet")}
                      value={formatNumber(trial.ajoajanPisteet)}
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
                      label={t("admin.trials.detail.fields.hakuMin1")}
                      value={formatNumber(trial.hakuMin1)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.hakuMin2")}
                      value={formatNumber(trial.hakuMin2)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.hauk")}
                      value={formatNumber(trial.haukkuKeskiarvo)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.ajoMin1")}
                      value={formatNumber(trial.ajoMin1)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.ajoMin2")}
                      value={formatNumber(trial.ajoMin2)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.era1Alkoi")}
                      value={showDash(trial.era1Alkoi)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.era2Alkoi")}
                      value={showDash(trial.era2Alkoi)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.yva")}
                      value={formatNumber(trial.yleisvaikutelmaPisteet)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.ajotaitoKeskiarvo")}
                      value={formatNumber(trial.ajotaitoKeskiarvo)}
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
                    <FieldRow
                      label={t(
                        "admin.trials.detail.fields.tappiopisteetYhteensa",
                      )}
                      value={formatNumber(trial.tappiopisteetYhteensa)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.paljasMaa")}
                      value={showDash(trial.paljasMaa)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.status")}
                  </SectionTitle>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow
                      label={t("admin.trials.detail.fields.luopui")}
                      value={showDash(trial.luopui)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.suljettu")}
                      value={showDash(trial.suljettu)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.keskeytetty")}
                      value={showDash(trial.keskeytetty)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.huomautusTeksti")}
                      value={showDash(trial.huomautusTeksti)}
                    />
                    <FieldRow
                      label={t("admin.trials.detail.fields.ryhmatuomariNimi")}
                      value={showDash(trial.ryhmatuomariNimi)}
                    />
                    <FieldRow
                      label={t(
                        "admin.trials.detail.fields.palkintotuomariNimi",
                      )}
                      value={showDash(trial.palkintotuomariNimi)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <SectionTitle>
                    {t("admin.trials.detail.sections.additional")}
                  </SectionTitle>
                  {lisatiedotRows.length > 0 ? (
                    <div className="overflow-x-auto rounded-md border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">
                              {t("admin.trials.detail.additional.columns.code")}
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                              {t("admin.trials.detail.additional.columns.name")}
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                              {t("admin.trials.detail.additional.columns.era1")}
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                              {t("admin.trials.detail.additional.columns.era2")}
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                              {t("admin.trials.detail.additional.columns.era3")}
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                              {t("admin.trials.detail.additional.columns.era4")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {lisatiedotRows.map((row) => (
                            <tr
                              className="border-t"
                              key={`${row.koodi}-${row.jarjestys}`}
                            >
                              <td className="px-3 py-2 align-top">
                                {showDash(row.koodi)}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {showDash(row.nimi)}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {showDash(row.era1Arvo)}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {showDash(row.era2Arvo)}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {showDash(row.era3Arvo)}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {showDash(row.era4Arvo)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.trials.detail.additional.unavailable")}
                    </p>
                  )}
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
