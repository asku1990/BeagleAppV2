"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import type {
  AdminShowWorkbookImportApplyResponse,
  AdminShowWorkbookImportPreviewResponse,
} from "@beagle/contracts";
import {
  applyAdminShowWorkbookImportAction,
  previewAdminShowWorkbookImportAction,
} from "@/app/actions/admin/shows/import";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import {
  formatShowWorkbookFileSize,
  isShowWorkbookFile,
  SHOW_WORKBOOK_ACCEPT,
} from "@/lib/admin/shows/import/workbook-file";
import { ShowWorkbookPreviewSection } from "./show-workbook-preview-section";
import { ShowWorkbookValidationPanel } from "./show-workbook-validation-panel";

export function AdminShowWorkbookImportPageClient() {
  const { t } = useI18n();
  const [selectedWorkbook, setSelectedWorkbook] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationResult, setValidationResult] =
    useState<AdminShowWorkbookImportPreviewResponse | null>(null);
  const [applyResult, setApplyResult] =
    useState<AdminShowWorkbookImportApplyResponse | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [hasAcceptedNotes, setHasAcceptedNotes] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const hasWorkbookFile = selectedWorkbook !== null;
  const hasReviewNotes =
    validationResult !== null &&
    (validationResult.warningCount > 0 ||
      validationResult.schema.ignoredColumns.length > 0);
  const hasBlockingErrors =
    validationResult !== null && validationResult.errorCount > 0;
  const canPreview =
    validationResult !== null &&
    !hasBlockingErrors &&
    validationError === null &&
    (!hasReviewNotes || hasAcceptedNotes);
  const canImport =
    canPreview &&
    !validationLoading &&
    !applyLoading &&
    validationResult !== null &&
    validationResult.errorCount === 0;
  const validationPanelMode =
    canPreview && !showValidationDetails ? "summary" : "full";

  function resetValidationState() {
    setValidationError(null);
    setValidationResult(null);
    setHasAcceptedNotes(false);
    setShowValidationDetails(false);
    setApplyResult(null);
    setApplyError(null);
    setApplyLoading(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedWorkbook(null);
      setFileError(null);
      resetValidationState();
      return;
    }

    if (!isShowWorkbookFile(file)) {
      setSelectedWorkbook(null);
      setFileError(t("admin.shows.import.invalidFile"));
      resetValidationState();
      event.currentTarget.value = "";
      return;
    }

    setSelectedWorkbook(file);
    setFileError(null);
    resetValidationState();
  }

  function handleResetFile() {
    setSelectedWorkbook(null);
    setFileError(null);
    resetValidationState();
    setInputKey((current) => current + 1);
  }

  async function handleValidate() {
    if (!selectedWorkbook || validationLoading) {
      return;
    }

    setValidationLoading(true);
    setValidationError(null);
    setValidationResult(null);
    setApplyResult(null);
    setApplyError(null);
    setHasAcceptedNotes(false);
    setShowValidationDetails(false);

    try {
      const formData = new FormData();
      formData.append("workbook", selectedWorkbook);

      const result = await previewAdminShowWorkbookImportAction(formData);
      if (!result.ok) {
        setValidationError(result.error.message);
        toast.error(result.error.message);
        return;
      }

      setValidationResult(result.data);
      if (result.data.errorCount > 0) {
        toast.error(
          `${t("admin.shows.import.toast.validationBlocked")}: ${result.data.errorCount} ${t("admin.shows.validation.summary.errors").toLowerCase()}.`,
        );
      } else if (
        result.data.warningCount > 0 ||
        result.data.schema.ignoredColumns.length > 0
      ) {
        toast.warning(
          `${t("admin.shows.import.toast.validationNotes")}: ${result.data.warningCount} ${t("admin.shows.validation.summary.warnings").toLowerCase()}, ${result.data.schema.ignoredColumns.length} ${t("admin.shows.validation.schema.coverageIgnored")}.`,
        );
      } else {
        toast.success(t("admin.shows.import.toast.validationReady"));
      }
    } catch {
      const message = t("admin.shows.preview.errorGeneric");
      setValidationError(message);
      toast.error(message);
    } finally {
      setValidationLoading(false);
    }
  }

  async function handleImport() {
    if (!selectedWorkbook || !canImport) {
      return;
    }

    setApplyLoading(true);
    setApplyError(null);
    setApplyResult(null);

    try {
      const formData = new FormData();
      formData.append("workbook", selectedWorkbook);
      const result = await applyAdminShowWorkbookImportAction(formData);
      if (!result.ok) {
        const errorMessage =
          result.error.code === "SHOW_WORKBOOK_IMPORT_TIMEOUT"
            ? t("admin.shows.import.error.timeout")
            : result.error.code === "SHOW_WORKBOOK_IMPORT_WRITE_FAILED"
              ? t("admin.shows.import.error.writeFailed")
              : result.error.message;
        setApplyError(errorMessage);
        setShowValidationDetails(true);
        toast.error(errorMessage);
        return;
      }
      setApplyResult(result.data);
      if (!result.data.success) {
        setValidationResult((current) =>
          current
            ? {
                ...current,
                issues: result.data.issues,
                infoCount: result.data.infoCount,
                warningCount: result.data.warningCount,
                errorCount: result.data.errorCount,
              }
            : current,
        );
        setShowValidationDetails(true);
        toast.error(
          `${t("admin.shows.import.toast.importBlocked")} (${result.data.errorCount} ${t("admin.shows.validation.summary.errors").toLowerCase()}).`,
        );
      } else {
        toast.success(
          `${t("admin.shows.import.toast.importDone")}: ${result.data.eventsCreated} ${t("admin.shows.preview.summary.events").toLowerCase()}, ${result.data.entriesCreated} ${t("admin.shows.preview.summary.entries").toLowerCase()}, ${result.data.itemsCreated} ${t("admin.shows.preview.summary.resultItems").toLowerCase()}.`,
        );
      }
    } catch {
      const message = t("admin.shows.preview.errorGeneric");
      setApplyError(message);
      toast.error(message);
    } finally {
      setApplyLoading(false);
    }
  }

  function handleAcceptNotes() {
    setHasAcceptedNotes(true);
    setShowValidationDetails(false);
  }

  function handleShowValidationDetails() {
    setShowValidationDetails(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/shows">{t("admin.shows.import.back")}</Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.shows.import.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.shows.import.pageDescription")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.shows.import.upload.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              htmlFor="show-workbook-upload"
            >
              {t("admin.shows.import.upload.label")}
            </label>
            <Input
              key={inputKey}
              id="show-workbook-upload"
              type="file"
              accept={SHOW_WORKBOOK_ACCEPT}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              {t("admin.shows.import.upload.help")}
            </p>
          </div>

          <div className="rounded-md border border-dashed border-border bg-muted/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("admin.shows.import.selected.label")}
                </p>
                <p className="truncate text-sm font-medium">
                  {selectedWorkbook
                    ? selectedWorkbook.name
                    : t("admin.shows.import.selected.empty")}
                </p>
                {selectedWorkbook ? (
                  <p className="text-xs text-muted-foreground">
                    {t("admin.shows.import.selected.size")}{" "}
                    {formatShowWorkbookFileSize(selectedWorkbook.size)}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFile}
                disabled={!hasWorkbookFile && fileError === null}
              >
                {t("admin.shows.import.selected.reset")}
              </Button>
            </div>
            {fileError ? (
              <p className="mt-3 text-sm text-destructive">{fileError}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!hasWorkbookFile || validationLoading || applyLoading}
              onClick={() => void handleValidate()}
            >
              {validationLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("admin.shows.import.actions.validating")}
                </>
              ) : validationResult ? (
                t("admin.shows.import.actions.revalidate")
              ) : (
                t("admin.shows.import.actions.validate")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!canImport}
              onClick={() => void handleImport()}
            >
              {applyLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("admin.shows.import.actions.importing")}
                </>
              ) : (
                t("admin.shows.import.actions.import")
              )}
            </Button>
          </div>

          {applyError ? (
            <p className="text-sm text-destructive">{applyError}</p>
          ) : null}
          {applyResult ? (
            <p
              className={`text-xs ${applyResult.success ? "text-emerald-700" : "text-destructive"}`}
            >
              {applyResult.success
                ? `${t("admin.shows.import.result.done")}: ${applyResult.eventsCreated} ${t("admin.shows.preview.summary.events").toLowerCase()}, ${applyResult.entriesCreated} ${t("admin.shows.preview.summary.entries").toLowerCase()}, ${applyResult.itemsCreated} ${t("admin.shows.preview.summary.resultItems").toLowerCase()}.`
                : `${t("admin.shows.import.result.blocked")}: ${applyResult.errorCount} ${t("admin.shows.validation.summary.errors").toLowerCase()}, ${applyResult.warningCount} ${t("admin.shows.validation.summary.warnings").toLowerCase()}, ${applyResult.infoCount} ${t("admin.shows.validation.summary.info").toLowerCase()}.`}
            </p>
          ) : null}

          <ShowWorkbookValidationPanel
            validation={validationResult}
            error={validationError}
            isLoading={validationLoading}
            mode={validationPanelMode}
            showAcceptanceActions={
              validationResult !== null &&
              validationError === null &&
              !hasBlockingErrors &&
              hasReviewNotes &&
              !hasAcceptedNotes
            }
            notesAccepted={hasAcceptedNotes}
            onAcceptNotes={handleAcceptNotes}
            onShowDetails={canPreview ? handleShowValidationDetails : undefined}
          />
        </CardContent>
      </Card>

      {canPreview ? (
        <ShowWorkbookPreviewSection
          preview={validationResult}
          acceptedNotesSummary={
            hasReviewNotes
              ? {
                  warningCount: validationResult.warningCount,
                  ignoredColumnCount:
                    validationResult.schema.ignoredColumns.length,
                }
              : null
          }
          onShowNotes={handleShowValidationDetails}
        />
      ) : null}
    </div>
  );
}
