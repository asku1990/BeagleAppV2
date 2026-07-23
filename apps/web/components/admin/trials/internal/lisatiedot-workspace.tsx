"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useResultCreateWorkspaceMobile } from "@/hooks/admin/trials/manage/use-result-create-workspace-mobile";
import { useI18n } from "@/hooks/i18n";
import {
  ADMIN_TRIAL_LISATIETO_GROUP_ORDER,
  ADMIN_TRIAL_LISATIETO_GROUP_LABELS,
  type AdminTrialLisatietoInputKind,
} from "@/lib/admin/trials/entry-edit-config";
import type {
  EraDraft,
  LisatietoRowDraft,
} from "@/lib/admin/trials/entry-edit-dialog-model";
import {
  createLisatiedotWorkspaceState,
  filterLisatietoRows,
  lisatietoRowKey,
  lisatiedotWorkspaceReducer,
} from "@/lib/admin/trials/lisatiedot-workspace-state";

type Props = {
  eras: EraDraft[];
  rows: LisatietoRowDraft[];
  isPending: boolean;
  onChangeCell: (
    koodi: string,
    osa: string,
    era: number,
    value: string,
  ) => void;
  onRemoveRow: (koodi: string, osa: string) => void;
};

const groupLabel = (group: string) =>
  ADMIN_TRIAL_LISATIETO_GROUP_LABELS[
    group as keyof typeof ADMIN_TRIAL_LISATIETO_GROUP_LABELS
  ] ?? group;

export function LisatiedotWorkspace({
  eras,
  rows,
  isPending,
  onChangeCell,
  onRemoveRow,
}: Props) {
  const { t } = useI18n();
  const [state, dispatch] = React.useReducer(
    lisatiedotWorkspaceReducer,
    rows,
    createLisatiedotWorkspaceState,
  );
  const isMobileWorkspace = useResultCreateWorkspaceMobile();
  const mobileControlRef = React.useRef<HTMLElement | null>(null);
  const rowTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const setMobileControlRef = React.useCallback(
    (element: HTMLElement | null) => {
      mobileControlRef.current = element;
    },
    [],
  );
  const groups = React.useMemo(
    () =>
      [...new Set(rows.map((row) => row.group))].sort(
        (left, right) =>
          ADMIN_TRIAL_LISATIETO_GROUP_ORDER.indexOf(
            left as (typeof ADMIN_TRIAL_LISATIETO_GROUP_ORDER)[number],
          ) -
          ADMIN_TRIAL_LISATIETO_GROUP_ORDER.indexOf(
            right as (typeof ADMIN_TRIAL_LISATIETO_GROUP_ORDER)[number],
          ),
      ),
    [rows],
  );
  const visibleRows = filterLisatietoRows(rows, state.query, state.activeGroup);
  const selectedRows = rows.filter((row) =>
    state.selectedRows.has(lisatietoRowKey(row)),
  );
  const activeRow =
    rows.find((row) => lisatietoRowKey(row) === state.activeRow) ?? null;

  React.useEffect(() => {
    if (!isMobileWorkspace && state.mobileSheetOpen) {
      dispatch({ type: "sheet", value: false });
    }
  }, [isMobileWorkspace, state.mobileSheetOpen]);

  function select(
    row: LisatietoRowDraft,
    mobile: boolean,
    trigger: HTMLButtonElement,
  ) {
    const key = lisatietoRowKey(row);
    rowTriggerRef.current = trigger;
    dispatch({ type: "select", value: key });
    dispatch({ type: "active", value: key, mobile });
  }
  function remove(row: LisatietoRowDraft) {
    onRemoveRow(row.koodi, row.osa);
    dispatch({ type: "remove", value: lisatietoRowKey(row) });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="space-y-1 text-sm">
          <span>{t("admin.trials.manage.resultCreate.additional.search")}</span>
          <Input
            value={state.query}
            placeholder={t(
              "admin.trials.manage.resultCreate.additional.searchPlaceholder",
            )}
            onChange={(event) =>
              dispatch({ type: "query", value: event.target.value })
            }
          />
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => dispatch({ type: "expand", values: groups })}
          >
            {t("admin.trials.manage.resultCreate.additional.expandAll")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => dispatch({ type: "collapse" })}
          >
            {t("admin.trials.manage.resultCreate.additional.collapseAll")}
          </Button>
        </div>
      </div>
      <div
        className="flex flex-wrap gap-2"
        aria-label={t("admin.trials.manage.resultCreate.additional.groups")}
      >
        <Button
          type="button"
          size="sm"
          variant={state.activeGroup === null ? "default" : "outline"}
          onClick={() => dispatch({ type: "group", value: null })}
        >
          {t("admin.trials.manage.resultCreate.additional.allGroups")}
        </Button>
        {groups.map((group) => (
          <Button
            key={group}
            type="button"
            size="sm"
            variant={state.activeGroup === group ? "default" : "outline"}
            onClick={() => dispatch({ type: "group", value: group })}
          >
            {groupLabel(group)}
          </Button>
        ))}
      </div>
      {selectedRows.length ? (
        <div
          className="flex flex-wrap gap-2"
          aria-label={t("admin.trials.manage.resultCreate.additional.selected")}
        >
          {selectedRows.map((row) => (
            <span
              key={lisatietoRowKey(row)}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
            >
              {row.koodi} {row.label}
              <button
                type="button"
                className="rounded px-1"
                aria-label={`${t("admin.trials.manage.resultCreate.additional.remove")} ${row.koodi} ${row.label}`}
                onClick={() => remove(row)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">
          {groups.map((group) => {
            const groupRows = visibleRows.filter((row) => row.group === group);
            if (!groupRows.length) return null;
            const expanded = state.expandedGroups.has(group);
            return (
              <div key={group} className="rounded-md border">
                <button
                  type="button"
                  className="flex w-full justify-between p-3 text-left font-medium"
                  aria-expanded={expanded}
                  onClick={() =>
                    dispatch({ type: "toggleGroup", value: group })
                  }
                >
                  {groupLabel(group)} <span>{groupRows.length}</span>
                </button>
                {expanded ? (
                  <div className="border-t p-2">
                    {groupRows.map((row) => (
                      <button
                        key={lisatietoRowKey(row)}
                        type="button"
                        className="block w-full rounded p-2 text-left hover:bg-muted"
                        onClick={(event) =>
                          select(row, isMobileWorkspace, event.currentTarget)
                        }
                      >
                        <span className="font-medium">{row.koodi}</span>{" "}
                        {row.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="hidden rounded-md border p-4 lg:block">
          {activeRow ? (
            <RowEditor
              row={activeRow}
              eras={eras}
              isPending={isPending}
              onChangeCell={onChangeCell}
              onRemove={() => remove(activeRow)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("admin.trials.manage.resultCreate.additional.chooseRow")}
            </p>
          )}
        </div>
      </div>
      <Sheet
        open={isMobileWorkspace && state.mobileSheetOpen}
        onOpenChange={(value) => dispatch({ type: "sheet", value })}
      >
        <SheetContent
          className="overflow-y-auto lg:hidden"
          closeLabel={t("admin.trials.manage.resultCreate.additional.close")}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            mobileControlRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            rowTriggerRef.current?.focus();
          }}
        >
          <SheetHeader>
            <SheetTitle>
              {activeRow ? `${activeRow.koodi} ${activeRow.label}` : ""}
            </SheetTitle>
            <SheetDescription>
              {t("admin.trials.manage.resultCreate.additional.editorHelp")}
            </SheetDescription>
          </SheetHeader>
          {activeRow ? (
            <div className="p-4">
              <RowEditor
                row={activeRow}
                eras={eras}
                isPending={isPending}
                onChangeCell={onChangeCell}
                onRemove={() => remove(activeRow)}
                setInitialControlRef={setMobileControlRef}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function sanitize(kind: AdminTrialLisatietoInputKind, value: string) {
  if (kind === "marker" || kind === "tri-state")
    return value === "0" || value === "1" ? value : "";
  if (kind === "text") return value;
  const normalized = value.replace(",", ".");
  return kind === "integer"
    ? normalized.replace(/[^\d-]/g, "")
    : normalized.replace(/[^\d.-]/g, "");
}

function RowEditor({
  row,
  eras,
  isPending,
  onChangeCell,
  onRemove,
  setInitialControlRef,
}: {
  row: LisatietoRowDraft;
  eras: EraDraft[];
  isPending: boolean;
  onChangeCell: Props["onChangeCell"];
  onRemove: () => void;
  setInitialControlRef?: (element: HTMLElement | null) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {row.koodi} {row.label}
          </p>
          <p className="text-sm text-muted-foreground">
            {t(
              `admin.trials.manage.resultCreate.valueHint.${row.valueHint ?? row.inputKind}` as never,
            )}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onRemove}>
          {t("admin.trials.manage.resultCreate.additional.remove")}
        </Button>
      </div>
      {eras.map((era, index) => {
        const value = row.eraValues[era.era] ?? "";
        const label = `${t("admin.trials.manage.resultCreate.additional.era")} ${era.era}`;
        const controlRef = index === 0 ? setInitialControlRef : undefined;
        return (
          <label key={era.era} className="block space-y-1 text-sm">
            <span>{label}</span>
            {row.inputKind === "marker" && row.useSemanticControl ? (
              <input
                ref={controlRef}
                type="checkbox"
                aria-label={`${row.koodi} ${row.label}, ${label}`}
                checked={value === "1"}
                disabled={isPending}
                onChange={(event) =>
                  onChangeCell(
                    row.koodi,
                    row.osa,
                    era.era,
                    event.target.checked ? "1" : "",
                  )
                }
              />
            ) : row.inputKind === "marker" || row.inputKind === "tri-state" ? (
              <select
                ref={controlRef}
                className="h-10 w-full rounded-md border bg-background px-3"
                aria-label={`${row.koodi} ${row.label}, ${label}`}
                value={value}
                disabled={isPending}
                onChange={(event) =>
                  onChangeCell(row.koodi, row.osa, era.era, event.target.value)
                }
              >
                <option value="">-</option>
                <option value="0">
                  {row.inputKind === "tri-state"
                    ? t("admin.trials.manage.resultCreate.triState.no")
                    : "0"}
                </option>
                <option value="1">
                  {row.inputKind === "tri-state"
                    ? t("admin.trials.manage.resultCreate.triState.yes")
                    : "1"}
                </option>
              </select>
            ) : (
              <Input
                ref={controlRef}
                aria-label={`${row.koodi} ${row.label}, ${label}`}
                inputMode={
                  row.inputKind === "text"
                    ? "text"
                    : row.inputKind === "integer"
                      ? "numeric"
                      : "decimal"
                }
                value={value}
                disabled={isPending}
                onChange={(event) =>
                  onChangeCell(
                    row.koodi,
                    row.osa,
                    era.era,
                    sanitize(row.inputKind, event.target.value),
                  )
                }
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
