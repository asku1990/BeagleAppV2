"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminTrialSummary } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { useAdminTrialsQuery } from "@/queries/admin/trials";
import { cn } from "@/lib/utils";

function showDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : "-";
}

function formatPiste(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("fi-FI", {
    maximumFractionDigits: 2,
  }).format(value);
}

function renderRegistrationCell(trial: AdminTrialSummary): {
  primary: string;
  secondary: string | null;
} {
  const fallbackIdentifier =
    trial.sklKoeId !== null ? String(trial.sklKoeId) : trial.entryKey;

  if (trial.registrationNo) {
    return {
      primary: trial.registrationNo,
      secondary: fallbackIdentifier,
    };
  }

  return {
    primary: fallbackIdentifier,
    secondary: null,
  };
}

const DEFAULT_PAGE_SIZE = 50;
const EMPTY_TRIALS: AdminTrialSummary[] = [];

export function AdminTrialsPageClient() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const filters = useMemo(
    () => ({
      query: query.trim().length > 0 ? query.trim() : undefined,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: "date-desc" as const,
    }),
    [query],
  );

  const trialsQuery = useAdminTrialsQuery(filters);
  const trials = trialsQuery.data?.items ?? EMPTY_TRIALS;
  const totalCount = trialsQuery.data?.total ?? trials.length;

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.trials.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.trials.description")}
        </p>
      </div>

      <ListingSectionShell
        title={t("admin.trials.manage.title")}
        subtitle={t("admin.trials.manage.description")}
        count={`${totalCount} ${t("admin.trials.manage.countSuffix")}`}
      >
        <div className="space-y-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("admin.trials.manage.filters.placeholder")}
            aria-label={t("admin.trials.manage.filters.aria")}
          />

          {trialsQuery.isLoading ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.trials.manage.loading")}
              </CardContent>
            </Card>
          ) : null}

          {trialsQuery.isError ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {t("admin.trials.manage.error")}
              </CardContent>
            </Card>
          ) : null}

          {!trialsQuery.isLoading && !trialsQuery.isError ? (
            <TrialResults trials={trials} />
          ) : null}
        </div>
      </ListingSectionShell>
    </div>
  );
}

function TrialResults({ trials }: { trials: AdminTrialSummary[] }) {
  const { t } = useI18n();
  const router = useRouter();

  if (trials.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("admin.trials.manage.empty")}
      </p>
    );
  }

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.dog")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.registration")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.date")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.place")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.piste")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.pa")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.sija")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.columns.judge")}
              </th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial) => {
              const registrationCell = renderRegistrationCell(trial);
              return (
                <tr
                  key={trial.trialId}
                  className={cn(
                    "border-b align-top cursor-pointer transition-colors",
                    "focus-visible:bg-muted/40 focus-visible:outline-none hover:bg-muted/20",
                  )}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t("admin.trials.manage.results.openDetailAriaPrefix")} ${showDash(trial.dogName)}`}
                  onClick={() => {
                    router.push(
                      `/admin/trials/${encodeURIComponent(trial.trialId)}`,
                    );
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                      return;
                    }

                    event.preventDefault();
                    router.push(
                      `/admin/trials/${encodeURIComponent(trial.trialId)}`,
                    );
                  }}
                >
                  <td className="px-2 py-2 font-medium">
                    {showDash(trial.dogName)}
                  </td>
                  <td className="px-2 py-2">
                    <div>{showDash(registrationCell.primary)}</div>
                    {registrationCell.secondary ? (
                      <div className="text-xs text-muted-foreground">
                        {registrationCell.secondary}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-2 py-2">
                    {formatDateForFinland(trial.eventDate)}
                  </td>
                  <td className="px-2 py-2">{showDash(trial.eventPlace)}</td>
                  <td className="px-2 py-2">
                    {formatPiste(trial.loppupisteet)}
                  </td>
                  <td className="px-2 py-2">{showDash(trial.palkinto)}</td>
                  <td className="px-2 py-2">{showDash(trial.sijoitus)}</td>
                  <td className="px-2 py-2">
                    {showDash(trial.ylituomariNimi)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
      mobile={trials.map((trial) => {
        const registrationCell = renderRegistrationCell(trial);

        return (
          <Card
            key={trial.trialId}
            role="button"
            tabIndex={0}
            aria-label={`${t("admin.trials.manage.results.openDetailAriaPrefix")} ${showDash(trial.dogName)}`}
            onClick={() => {
              router.push(`/admin/trials/${encodeURIComponent(trial.trialId)}`);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") {
                return;
              }

              event.preventDefault();
              router.push(`/admin/trials/${encodeURIComponent(trial.trialId)}`);
            }}
            className={cn(
              "cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted/20",
            )}
          >
            <CardContent className="space-y-3 pt-4">
              <div>
                <p className="font-medium">{showDash(trial.dogName)}</p>
                <p className="text-sm text-muted-foreground">
                  {showDash(registrationCell.primary)}
                </p>
                {registrationCell.secondary ? (
                  <p className="text-xs text-muted-foreground">
                    {registrationCell.secondary}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.trials.manage.mobile.date")}:
                  </span>{" "}
                  {formatDateForFinland(trial.eventDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.trials.manage.mobile.place")}:
                  </span>{" "}
                  {showDash(trial.eventPlace)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.trials.manage.mobile.piste")}:
                  </span>{" "}
                  {formatPiste(trial.loppupisteet)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.trials.manage.mobile.pa")}:
                  </span>{" "}
                  {showDash(trial.palkinto)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.trials.manage.mobile.sija")}:
                  </span>{" "}
                  {showDash(trial.sijoitus)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.trials.manage.mobile.judge")}:
                  </span>{" "}
                  {showDash(trial.ylituomariNimi)}
                </p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("admin.trials.manage.results.openDetailHint")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    />
  );
}
