"use client";

import React from "react";
import {
  ListingSectionShell,
  ListingResponsiveResults,
} from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import type {
  AdminTrialEventDetails,
  AdminTrialEventEntry,
} from "@beagle/contracts";
import { formatPoints, showDash } from "./internal/trial-ui";
import { AdminTrialEntryActions } from "./admin-trial-entry-actions";

type AdminTrialSelectedEventPanelProps = {
  selectedEvent: AdminTrialEventDetails | null;
  isLoading: boolean;
  isError: boolean;
  errorText: string;
};

const EMPTY_ENTRIES: AdminTrialEventEntry[] = [];

export function AdminTrialSelectedEventPanel({
  selectedEvent,
  isLoading,
  isError,
  errorText,
}: AdminTrialSelectedEventPanelProps) {
  const { t } = useI18n();
  const selectedEntries = selectedEvent?.entries ?? EMPTY_ENTRIES;

  return (
    <ListingSectionShell
      title={t("admin.trials.manage.selected.title")}
      subtitle={t("admin.trials.manage.selected.subtitle")}
    >
      <div className="space-y-3">
        {isError ? (
          <Card>
            <CardContent className="p-5 text-sm text-destructive">
              {errorText}
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              {t("admin.trials.manage.selected.loading")}
            </CardContent>
          </Card>
        ) : selectedEvent ? (
          <>
            <div className="rounded-md border p-4">
              <p className="text-sm font-medium">
                {formatDateForFinland(selectedEvent.eventDate)} •{" "}
                {selectedEvent.eventPlace}
              </p>
              <p className="text-sm text-muted-foreground">
                {showDash(selectedEvent.eventName)} •{" "}
                {showDash(selectedEvent.judge)} • {selectedEvent.dogCount}{" "}
                {t("admin.trials.manage.selected.countSuffix")}
              </p>
            </div>
            <SelectedEventEntries entries={selectedEntries} />
          </>
        ) : (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              {t("admin.trials.manage.selected.empty")}
            </CardContent>
          </Card>
        )}
      </div>
    </ListingSectionShell>
  );
}

function SelectedEventEntries({
  entries,
}: {
  entries: AdminTrialEventEntry[];
}) {
  const { t } = useI18n();

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("admin.trials.manage.selected.emptyRows")}
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
                {t("admin.trials.manage.selected.columns.dog")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.registration")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.points")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.award")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.rank")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.judge")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.trialId} className="border-b align-top">
                <td className="px-2 py-2 font-medium">
                  {showDash(entry.dogName)}
                </td>
                <td className="px-2 py-2">{showDash(entry.registrationNo)}</td>
                <td className="px-2 py-2">{formatPoints(entry.points)}</td>
                <td className="px-2 py-2">{showDash(entry.award)}</td>
                <td className="px-2 py-2">{showDash(entry.rank)}</td>
                <td className="px-2 py-2">{showDash(entry.judge)}</td>
                <td className="px-2 py-2">
                  <AdminTrialEntryActions trialId={entry.trialId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      mobile={entries.map((entry) => (
        <Card key={entry.trialId}>
          <CardContent className="space-y-2 pt-4 text-sm">
            <p className="font-medium">{showDash(entry.dogName)}</p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.registration")}:
              </span>{" "}
              {showDash(entry.registrationNo)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.points")}:
              </span>{" "}
              {formatPoints(entry.points)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.award")}:
              </span>{" "}
              {showDash(entry.award)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.rank")}:
              </span>{" "}
              {showDash(entry.rank)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.judge")}:
              </span>{" "}
              {showDash(entry.judge)}
            </p>
            <AdminTrialEntryActions trialId={entry.trialId} />
          </CardContent>
        </Card>
      ))}
    />
  );
}
