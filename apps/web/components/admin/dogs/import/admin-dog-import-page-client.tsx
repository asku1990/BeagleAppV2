"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createAdminDogsApiClient } from "@beagle/api-client";
import type {
  AdminDogImportPreviewRow,
  AdminFinnishKennelClubImportApplyResponse,
  AdminFinnishKennelClubImportPreviewResponse,
} from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";

const client = createAdminDogsApiClient();
const PAGE_SIZE = 10;
const issueLabelKeys = {
  PARENT_SEX_CONFLICT: "admin.dogs.import.issue.PARENT_SEX_CONFLICT",
} as const;
type Filter = "ALL" | "BLOCKED" | "WARNING" | "CREATE" | "UPDATE" | "UNCHANGED";
const isReferenceRow = (row: AdminDogImportPreviewRow) =>
  row.issues.some((issue) => issue.resolution === "CREATE_REFERENCE");

export function AdminDogImportPageClient() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] =
    useState<AdminFinnishKennelClubImportPreviewResponse | null>(null);
  const [result, setResult] =
    useState<AdminFinnishKennelClubImportApplyResponse | null>(null);
  const [step, setStep] = useState<
    "upload" | "review" | "confirm" | "complete"
  >("upload");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function replace(next: File | null) {
    setFile(next);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep("upload");
    setFilter("ALL");
    setSearch("");
    setPage(1);
  }
  async function review() {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    const response = await client.previewFinnishKennelClubImport(file);
    setBusy(false);
    if (!response.ok) return setError(response.error);
    setPreview(response.data);
    setStep("review");
  }
  async function apply() {
    if (!file || !preview || busy) return;
    setBusy(true);
    const response = await client.applyFinnishKennelClubImport(
      file,
      preview.previewDigest,
      preview.sourceFileSha256,
    );
    setBusy(false);
    if (!response.ok) {
      setError(response.error);
      setStep("review");
      return;
    }
    if (!response.data.success) {
      setError(response.data.issues.map((issue) => issue.message).join(" "));
      setStep("review");
      return;
    }
    setResult(response.data);
    setStep("complete");
  }
  const filteredRows = useMemo(() => {
    if (!preview) return [];
    const query = search.trim().toLowerCase();
    return preview.rows.filter((row) => {
      const matchesSearch =
        !query || (row.registrationNo ?? "").toLowerCase().includes(query);
      const matchesFilter =
        filter === "ALL" ||
        (filter === "WARNING" &&
          row.issues.some((issue) => issue.severity === "WARNING")) ||
        (filter === "BLOCKED" && row.status === "BLOCKED") ||
        filter === row.status;
      return matchesSearch && matchesFilter;
    });
  }, [filter, preview, search]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const labels = {
    ALL: "admin.dogs.import.review.all",
    BLOCKED: "admin.dogs.import.review.blocked",
    WARNING: "admin.dogs.import.review.warnings",
    CREATE: "admin.dogs.import.review.create",
    UPDATE: "admin.dogs.import.review.update",
    UNCHANGED: "admin.dogs.import.review.unchanged",
  } as const;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("admin.dogs.import.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.dogs.import.source")}
        </p>
      </div>
      <p className="text-sm">{t("admin.dogs.import.steps")}</p>
      <Card>
        <CardHeader>
          <CardTitle>
            {step === "complete"
              ? t("admin.dogs.import.complete.title")
              : step === "confirm"
                ? t("admin.dogs.import.confirm.title")
                : step === "review"
                  ? t("admin.dogs.import.review.title")
                  : t("admin.dogs.import.upload.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "complete" && result ? (
            <>
              <p>{t("admin.dogs.import.complete.summary")}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    ["admin.dogs.import.complete.created", result.createdCount],
                    ["admin.dogs.import.complete.updated", result.updatedCount],
                    [
                      "admin.dogs.import.complete.unchanged",
                      result.unchangedCount,
                    ],
                    [
                      "admin.dogs.import.complete.reference",
                      result.referenceCount,
                    ],
                  ] as const
                ).map(([label, count]) => (
                  <div className="rounded-md border p-3" key={label}>
                    <div className="text-xs text-muted-foreground">
                      {t(label)}
                    </div>
                    <div className="text-xl font-semibold">{count}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/admin/dogs">
                    {t("admin.dogs.import.complete.dogs")}
                  </Link>
                </Button>
                <Button onClick={() => replace(null)}>
                  {t("admin.dogs.import.complete.another")}
                </Button>
              </div>
            </>
          ) : (
            <>
              {step === "upload" ? (
                <p className="text-sm text-muted-foreground">
                  {t("admin.dogs.import.upload.guidance")}
                </p>
              ) : null}
              <Input
                type="file"
                accept=".xlsx"
                onChange={(event) => replace(event.target.files?.[0] ?? null)}
                disabled={busy || step !== "upload"}
              />
              {file ? (
                <p className="text-sm">
                  {t("admin.dogs.import.selected")}: {file.name} (
                  {Math.ceil(file.size / 1024)} KiB)
                </p>
              ) : null}
              {step === "upload" ? (
                <Button disabled={!file || busy} onClick={() => void review()}>
                  {t("admin.dogs.import.upload.review")}
                </Button>
              ) : null}
              {step !== "upload" ? (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => replace(null)}
                >
                  {t("admin.dogs.import.replace")}
                </Button>
              ) : null}
              {preview && step === "review" ? (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                    {(
                      [
                        ["admin.dogs.import.review.rows", preview.rowCount],
                        [
                          "admin.dogs.import.review.create",
                          preview.createCount,
                        ],
                        [
                          "admin.dogs.import.review.update",
                          preview.updateCount,
                        ],
                        [
                          "admin.dogs.import.review.unchanged",
                          preview.unchangedCount,
                        ],
                        [
                          "admin.dogs.import.review.blocked",
                          preview.blockedCount,
                        ],
                        [
                          "admin.dogs.import.review.reference",
                          preview.referenceCount,
                        ],
                      ] as const
                    ).map(([label, count]) => (
                      <div className="rounded-md border p-2" key={label}>
                        <div className="text-xs text-muted-foreground">
                          {t(label)}
                        </div>
                        <div className="font-semibold">{count}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(labels) as Filter[]).map((value) => (
                      <Button
                        key={value}
                        size="sm"
                        variant={filter === value ? "default" : "outline"}
                        onClick={() => {
                          setFilter(value);
                          setPage(1);
                        }}
                      >
                        {t(labels[value])}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder={t("admin.dogs.import.review.search")}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />
                  <div className="max-h-96 overflow-auto text-sm">
                    {visibleRows.length === 0 ? (
                      <p className="p-3 text-muted-foreground">
                        {t("admin.dogs.import.review.empty")}
                      </p>
                    ) : (
                      visibleRows.map((row) => (
                        <div
                          key={row.sourceRowNumber}
                          className="border-b py-2"
                        >
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() =>
                              setExpanded(
                                expanded === row.sourceRowNumber
                                  ? null
                                  : row.sourceRowNumber,
                              )
                            }
                          >
                            <span className="font-medium">
                              {row.registrationNo ?? "-"}
                            </span>{" "}
                            · {t("admin.dogs.import.review.row")}{" "}
                            {row.sourceRowNumber} ·{" "}
                            {t(
                              `admin.dogs.import.status.${row.status}` as never,
                            )}{" "}
                            {isReferenceRow(row)
                              ? `· ${t("admin.dogs.import.review.reference")}`
                              : null}
                          </button>
                          {expanded === row.sourceRowNumber ? (
                            <div className="mt-2 space-y-2 rounded bg-muted/40 p-2">
                              {row.issues.length === 0 ? (
                                <span>-</span>
                              ) : (
                                row.issues.map((issue, index) => (
                                  <div key={`${issue.code}-${index}`}>
                                    <div className="font-medium">
                                      {issueLabelKeys[
                                        issue.code as keyof typeof issueLabelKeys
                                      ]
                                        ? t(
                                            issueLabelKeys[
                                              issue.code as keyof typeof issueLabelKeys
                                            ],
                                          )
                                        : issue.code}
                                    </div>
                                    <div>
                                      {issue.field ?? "-"}:{" "}
                                      {t("admin.dogs.import.review.current")}{" "}
                                      {String(issue.currentValue ?? "-")} ·{" "}
                                      {t("admin.dogs.import.review.incoming")}{" "}
                                      {String(issue.incomingValue ?? "-")}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      ‹
                    </Button>
                    <span>
                      {page} / {pageCount}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= pageCount}
                      onClick={() => setPage(page + 1)}
                    >
                      ›
                    </Button>
                  </div>
                  <p className="text-sm text-destructive">
                    {preview.blockedCount}{" "}
                    {t("admin.dogs.import.review.blocked")},{" "}
                    {
                      preview.issues.filter(
                        (issue) => issue.severity === "WARNING",
                      ).length
                    }{" "}
                    {t("admin.dogs.import.review.warnings")}
                  </p>
                  <Button
                    disabled={!preview.applyAllowed || busy}
                    onClick={() => setStep("confirm")}
                  >
                    {t("admin.dogs.import.review.continue")}
                  </Button>
                </>
              ) : null}
              {preview && step === "confirm" ? (
                <div className="space-y-3">
                  <p>{file?.name}</p>
                  <p className="text-sm">
                    {t("admin.dogs.import.confirm.hash")}:{" "}
                    {preview.sourceFileSha256.slice(0, 12)}…
                  </p>
                  <p className="text-sm">
                    {preview.createCount} / {preview.updateCount} /{" "}
                    {preview.unchangedCount} / {preview.referenceCount}
                  </p>
                  <p className="text-sm">
                    {t("admin.dogs.import.confirm.noClearing")}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("review")}>
                      {t("admin.dogs.import.confirm.back")}
                    </Button>
                    <Button disabled={busy} onClick={() => void apply()}>
                      {t("admin.dogs.import.confirm.apply")}
                    </Button>
                  </div>
                </div>
              ) : null}
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
