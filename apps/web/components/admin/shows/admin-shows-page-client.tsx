"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";

const WORKBOOK_ACCEPT =
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function isWorkbookFile(file: File): boolean {
  const normalizedName = file.name.trim().toLowerCase();
  return (
    normalizedName.endsWith(".xlsx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kib = bytes / 1024;
  if (kib < 1024) {
    return `${kib.toFixed(kib < 10 ? 1 : 0)} KiB`;
  }

  const mib = kib / 1024;
  return `${mib.toFixed(mib < 10 ? 1 : 0)} MiB`;
}

export function AdminShowsPageClient() {
  const { t } = useI18n();
  const [selectedWorkbook, setSelectedWorkbook] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const hasWorkbookFile = selectedWorkbook !== null;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedWorkbook(null);
      setFileError(null);
      return;
    }

    if (!isWorkbookFile(file)) {
      setSelectedWorkbook(null);
      setFileError(t("admin.shows.import.invalidFile"));
      event.currentTarget.value = "";
      return;
    }

    setSelectedWorkbook(file);
    setFileError(null);
  }

  function handleResetFile() {
    setSelectedWorkbook(null);
    setFileError(null);
    setInputKey((current) => current + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.shows.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.shows.description")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.shows.import.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("admin.shows.import.description")}
            </p>

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
                accept={WORKBOOK_ACCEPT}
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
                      {formatFileSize(selectedWorkbook.size)}
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
              <Button type="button" disabled={!hasWorkbookFile}>
                {t("admin.shows.import.actions.validate")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!hasWorkbookFile}
              >
                {t("admin.shows.import.actions.preview")}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("admin.shows.import.actions.placeholder")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.shows.runs.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("admin.shows.runs.description")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.shows.search.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("admin.shows.search.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
