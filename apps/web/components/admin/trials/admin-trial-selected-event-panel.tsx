"use client";

import React from "react";
import {
  ListingSectionShell,
  ListingResponsiveResults,
} from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  useUpdateAdminTrialEntryMutation,
  useUpdateAdminTrialEventMutation,
} from "@/queries/admin/trials";
import type {
  AdminTrialEventDetails,
  AdminTrialEventEntry,
  UpdateAdminTrialEntryRequest,
} from "@beagle/contracts";
import { formatPoints, showDash } from "./internal/trial-ui";
import { AdminTrialEntryActions } from "./admin-trial-entry-actions";
import {
  AdminTrialEventEditDialog,
  type UpdateAdminTrialEventPayload,
} from "./admin-trial-event-edit-dialog";
import { AdminTrialEntryEditDialog } from "./admin-trial-entry-edit-dialog";

type AdminTrialSelectedEventPanelProps = {
  selectedEvent: AdminTrialEventDetails | null;
  isLoading: boolean;
  isError: boolean;
  errorText: string;
  onDeletedTrialEvent: (deletedTrialEventId: string) => void;
};

const EMPTY_ENTRIES: AdminTrialEventEntry[] = [];

export function AdminTrialSelectedEventPanel({
  selectedEvent,
  isLoading,
  isError,
  errorText,
  onDeletedTrialEvent,
}: AdminTrialSelectedEventPanelProps) {
  const { t } = useI18n();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [entryEditError, setEntryEditError] = React.useState<string | null>(
    null,
  );
  const [editingEntry, setEditingEntry] =
    React.useState<AdminTrialEventEntry | null>(null);
  const updateMutation = useUpdateAdminTrialEventMutation();
  const updateEntryMutation = useUpdateAdminTrialEntryMutation();
  const selectedEntries = selectedEvent?.entries ?? EMPTY_ENTRIES;

  async function handleSaveEdit(
    payload: UpdateAdminTrialEventPayload,
  ): Promise<boolean> {
    try {
      setEditError(null);
      await updateMutation.mutateAsync(payload);
      return true;
    } catch (error) {
      if (error instanceof AdminMutationError) {
        setEditError(error.message);
        return false;
      }

      setEditError(t("admin.trials.manage.eventModal.updateFailed"));
      return false;
    }
  }

  async function handleSaveEntryEdit(
    payload: UpdateAdminTrialEntryRequest,
  ): Promise<boolean> {
    try {
      setEntryEditError(null);
      await updateEntryMutation.mutateAsync(payload);
      return true;
    } catch (error) {
      if (error instanceof AdminMutationError) {
        setEntryEditError(error.message);
        return false;
      }
      setEntryEditError(t("admin.trials.manage.entryModal.updateFailed"));
      return false;
    }
  }

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
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {formatDateForFinland(selectedEvent.eventDate)} •{" "}
                    {selectedEvent.eventPlace}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {showDash(selectedEvent.eventName)} •{" "}
                    {showDash(selectedEvent.ylituomari)} •{" "}
                    {selectedEvent.dogCount}{" "}
                    {t("admin.trials.manage.selected.countSuffix")}
                  </p>
                  <div className="mt-2 grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
                    <p>
                      {t("admin.trials.manage.eventModal.fields.jarjestaja")}:{" "}
                      {showDash(selectedEvent.jarjestaja)}
                    </p>
                    <p>
                      {t("admin.trials.manage.eventModal.fields.ylituomari")}:
                      {" " + showDash(selectedEvent.ylituomari)}
                    </p>
                    <p>
                      {t(
                        "admin.trials.manage.eventModal.fields.ylituomariNumero",
                      )}
                      : {showDash(selectedEvent.ylituomariNumero)}
                    </p>
                    <p>
                      {t("admin.trials.manage.eventModal.fields.sklKoeId")}:{" "}
                      {showDash(
                        selectedEvent.sklKoeId === null
                          ? null
                          : String(selectedEvent.sklKoeId),
                      )}
                    </p>
                    <p>
                      {t("admin.trials.manage.eventModal.fields.kennelpiiri")}:{" "}
                      {showDash(selectedEvent.kennelpiiri)}
                    </p>
                    <p>
                      {t(
                        "admin.trials.manage.eventModal.fields.kennelpiirinro",
                      )}
                      : {showDash(selectedEvent.kennelpiirinro)}
                    </p>
                    <p className="md:col-span-2">
                      {t("admin.trials.manage.eventModal.fields.ytKertomus")}:{" "}
                      {showDash(selectedEvent.ytKertomus)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setEditError(null);
                    setIsEditOpen(true);
                  }}
                  disabled={updateMutation.isPending}
                >
                  {t("admin.trials.manage.selected.actions.editEvent")}
                </Button>
              </div>
            </div>
            <SelectedEventEntries
              trialEventId={selectedEvent.trialEventId}
              eventDate={selectedEvent.eventDate}
              eventPlace={selectedEvent.eventPlace}
              eventName={selectedEvent.eventName}
              entries={selectedEntries}
              onDeletedTrialEvent={onDeletedTrialEvent}
              onEditEntry={(entry) => {
                setEntryEditError(null);
                setEditingEntry(entry);
              }}
            />
            <AdminTrialEventEditDialog
              open={isEditOpen}
              selectedEvent={selectedEvent}
              isPending={updateMutation.isPending}
              errorText={editError}
              onClose={() => setIsEditOpen(false)}
              onSave={handleSaveEdit}
            />
            {editingEntry ? (
              <AdminTrialEntryEditDialog
                open
                trialEventId={selectedEvent.trialEventId}
                eventDate={selectedEvent.eventDate}
                eventPlace={selectedEvent.eventPlace}
                entry={editingEntry}
                isPending={updateEntryMutation.isPending}
                errorText={entryEditError}
                onClose={() => setEditingEntry(null)}
                onSave={handleSaveEntryEdit}
              />
            ) : null}
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
  trialEventId,
  eventDate,
  eventPlace,
  eventName,
  entries,
  onDeletedTrialEvent,
  onEditEntry,
}: {
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  eventName: string | null;
  entries: AdminTrialEventEntry[];
  onDeletedTrialEvent: (deletedTrialEventId: string) => void;
  onEditEntry: (entry: AdminTrialEventEntry) => void;
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
                  <AdminTrialEntryActions
                    trialEventId={trialEventId}
                    trialEntryId={entry.trialId}
                    trialId={entry.trialId}
                    dogName={entry.dogName}
                    registrationNo={entry.registrationNo}
                    eventDate={eventDate}
                    eventPlace={eventPlace}
                    eventName={eventName}
                    onEditEntry={() => onEditEntry(entry)}
                    onDeletedTrialEvent={onDeletedTrialEvent}
                  />
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
            <AdminTrialEntryActions
              trialEventId={trialEventId}
              trialEntryId={entry.trialId}
              trialId={entry.trialId}
              dogName={entry.dogName}
              registrationNo={entry.registrationNo}
              eventDate={eventDate}
              eventPlace={eventPlace}
              eventName={eventName}
              onEditEntry={() => onEditEntry(entry)}
              onDeletedTrialEvent={onDeletedTrialEvent}
            />
          </CardContent>
        </Card>
      ))}
    />
  );
}
