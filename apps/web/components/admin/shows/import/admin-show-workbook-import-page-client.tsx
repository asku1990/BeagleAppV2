"use client";

import React from "react";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import type { AdminShowWorkbookImportPreviewResponse } from "@beagle/contracts";
import { previewAdminShowWorkbookImportAction } from "@/app/actions/admin/shows/import";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const hasWorkbookFile = selectedWorkbook !== null;
  const canPreview =
    validationResult !== null &&
    validationResult.errorCount === 0 &&
    validationError === null;
  const validationPanelMode = canPreview ? "summary" : "full";

  function resetValidationState() {
    setValidationError(null);
    setValidationResult(null);
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

    try {
      const formData = new FormData();
      formData.append("workbook", selectedWorkbook);

      const result = await previewAdminShowWorkbookImportAction(formData);
      if (!result.ok) {
        setValidationError(result.error.message);
        return;
      }

      setValidationResult(result.data);
    } catch {
      setValidationError(t("admin.shows.preview.errorGeneric"));
    } finally {
      setValidationLoading(false);
    }
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
              disabled={!hasWorkbookFile || validationLoading}
              onClick={() => void handleValidate()}
            >
              {validationResult
                ? t("admin.shows.import.actions.revalidate")
                : t("admin.shows.import.actions.validate")}
            </Button>
            <Button type="button" variant="outline" disabled>
              {t("admin.shows.import.actions.import")}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("admin.shows.import.actions.placeholder")}
          </p>

          <ShowWorkbookValidationPanel
            validation={validationResult}
            error={validationError}
            isLoading={validationLoading}
            mode={validationPanelMode}
          />
        </CardContent>
      </Card>

      {canPreview ? (
        <ShowWorkbookPreviewSection preview={validationResult} />
      ) : null}
    </div>
  );
}
