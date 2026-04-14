"use client";

import { useMemo, useState } from "react";
import type { AdminTrialSummary } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { useAdminTrialsQuery } from "@/queries/admin/trials";

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
  if (trial.registrationNo) {
    return {
      primary: trial.registrationNo,
      secondary: trial.sourceKey,
    };
  }

  return {
    primary: trial.sourceKey,
    secondary: null,
  };
}

const DEFAULT_PAGE_SIZE = 50;
const EMPTY_TRIALS: AdminTrialSummary[] = [];

export function AdminTrialsPageClient() {
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
          AJOK: koetulokset
        </h1>
        <p className="text-sm text-muted-foreground">
          Read-only näkymä nykyisestä TrialResult-datasta.
        </p>
      </div>

      <ListingSectionShell
        title="Koetulokset"
        subtitle="Hae nykyiset ajokokeiden rivit."
        count={`${totalCount} tulosta`}
      >
        <div className="space-y-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hae koetuloksia"
            aria-label="Hae koetuloksia"
          />

          {trialsQuery.isLoading ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                Ladataan koetuloksia...
              </CardContent>
            </Card>
          ) : null}

          {trialsQuery.isError ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                Koetulosten lataus epäonnistui.
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
  if (trials.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ei koetuloksia näytettäväksi.
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
              <th className="px-2 py-2">Koira</th>
              <th className="px-2 py-2">Rekisteri / sourceKey</th>
              <th className="px-2 py-2">Päivä</th>
              <th className="px-2 py-2">Paikka</th>
              <th className="px-2 py-2">Pisteet</th>
              <th className="px-2 py-2">Pa</th>
              <th className="px-2 py-2">Sija</th>
              <th className="px-2 py-2">Tuomari</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial) => {
              const registrationCell = renderRegistrationCell(trial);
              return (
                <tr key={trial.trialId} className="border-b align-top">
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
                  <td className="px-2 py-2">{formatPiste(trial.piste)}</td>
                  <td className="px-2 py-2">{showDash(trial.pa)}</td>
                  <td className="px-2 py-2">{showDash(trial.sija)}</td>
                  <td className="px-2 py-2">{showDash(trial.judge)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
      mobile={trials.map((trial) => {
        const registrationCell = renderRegistrationCell(trial);

        return (
          <Card key={trial.trialId}>
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
                  <span className="text-muted-foreground">Päivä:</span>{" "}
                  {formatDateForFinland(trial.eventDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">Paikka:</span>{" "}
                  {showDash(trial.eventPlace)}
                </p>
                <p>
                  <span className="text-muted-foreground">Pisteet:</span>{" "}
                  {formatPiste(trial.piste)}
                </p>
                <p>
                  <span className="text-muted-foreground">Pa:</span>{" "}
                  {showDash(trial.pa)}
                </p>
                <p>
                  <span className="text-muted-foreground">Sija:</span>{" "}
                  {showDash(trial.sija)}
                </p>
                <p>
                  <span className="text-muted-foreground">Tuomari:</span>{" "}
                  {showDash(trial.judge)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    />
  );
}
