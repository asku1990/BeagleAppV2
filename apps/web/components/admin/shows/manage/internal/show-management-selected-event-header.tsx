"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import type { ManageShowEvent } from "../show-management-types";

function formatText(value: string): string {
  const normalized = value.trim();
  return normalized || "-";
}

export function ShowManagementSelectedEventHeader({
  selectedEvent,
  isEditDisabled,
  onEdit,
}: {
  selectedEvent: ManageShowEvent;
  isEditDisabled: boolean;
  onEdit: () => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t("admin.shows.manage.selectedEvent.label")}
          </p>
          <h2 className="text-lg font-semibold">{selectedEvent.eventPlace}</h2>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <p>
            <span className="text-muted-foreground">
              {t("admin.shows.manage.results.date")}:
            </span>{" "}
            {formatDateForFinland(selectedEvent.eventDate)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("admin.shows.manage.results.city")}:
            </span>{" "}
            {formatText(selectedEvent.eventCity)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("admin.shows.manage.results.event")}:
            </span>{" "}
            {formatText(selectedEvent.eventName)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("admin.shows.manage.results.type")}:
            </span>{" "}
            {formatText(selectedEvent.eventType)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("admin.shows.manage.results.organizer")}:
            </span>{" "}
            {formatText(selectedEvent.organizer)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("admin.shows.manage.results.judge")}:
            </span>{" "}
            {formatText(selectedEvent.judge)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("admin.shows.manage.results.dogs")}:
            </span>{" "}
            {selectedEvent.entries.length}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onEdit} disabled={isEditDisabled}>
          {t("admin.shows.manage.selectedEvent.edit")}
        </Button>
      </div>
    </>
  );
}
