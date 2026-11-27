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
const issueLabelKeys = {
  DOG_COLOR_UNRESOLVED: "admin.dogs.import.issue.unknownColor",
  MULTIPLE_SOURCE_ROWS_SAME_DOG: "admin.dogs.import.issue.sameDog",
  DUPLICATE_COLUMN: "admin.dogs.import.issue.duplicateHeader",
  REQUIRED_COLUMN_MISSING: "admin.dogs.import.issue.missingHeader",
  OPTIONAL_COLUMN_MISSING: "admin.dogs.import.issue.optionalHeader",
  UNNAMED_COLUMN_WITH_DATA: "admin.dogs.import.issue.unnamedHeader",
  UNSUPPORTED_COLUMN_IGNORED: "admin.dogs.import.issue.ignoredHeader",
  ADDITIONAL_SHEETS_IGNORED: "admin.dogs.import.issue.extraSheets",
  REGISTRATION_CANONICAL_COLLISION: "admin.dogs.import.issue.collision",
  SOURCE_FILE_UNREADABLE: "admin.dogs.import.issue.unreadable",
  SOURCE_RESOURCE_LIMIT_EXCEEDED: "admin.dogs.import.issue.limit",
  PARENT_SEX_CONFLICT: "admin.dogs.import.issue.PARENT_SEX_CONFLICT",
  DOG_BREEDER_NOT_FOUND: "admin.dogs.import.issue.DOG_BREEDER_NOT_FOUND",
  DOG_BREEDER_AMBIGUOUS: "admin.dogs.import.issue.DOG_BREEDER_AMBIGUOUS",
  DOG_BREEDER_LINK_CONFLICT:
    "admin.dogs.import.issue.DOG_BREEDER_LINK_CONFLICT",
} as const;
type Filter =
  | "ALL"
  | "BLOCKED"
  | "WARNING"
  | "REFERENCE"
  | "CREATE"
  | "UPDATE"
  | "UNCHANGED";
const fieldLabels = {
  registeredOn: "admin.dogs.import.field.registeredOn",
  originTypeText: "admin.dogs.import.field.origin",
  originCountryText: "admin.dogs.import.field.country",
  tailText: "admin.dogs.import.field.tail",
  colorName: "admin.dogs.import.field.color",
  breeder: "admin.dogs.import.review.breeder",
  birthDate: "admin.dogs.import.field.birthDate",
  name: "admin.dogs.import.field.name",
  sex: "admin.dogs.import.field.sex",
  sireRegistrationNo: "admin.dogs.import.field.sire",
  damRegistrationNo: "admin.dogs.import.field.dam",
  status: "admin.dogs.import.field.status",
  registrationNo: "admin.dogs.import.field.registration",
} as const;

export function AdminDogImportPageClient() {
  const { t } = useI18n();
  const issueLabel = (
    code: AdminDogImportPreviewRow["issues"][number]["code"],
  ) => {
    const key = issueLabelKeys[code as keyof typeof issueLabelKeys];
    return key ? t(key) : code;
  };
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
    if (!file || !preview?.applyAllowed || busy) return;
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
        filter === "ALL" || (filter !== "BLOCKED" && filter === row.status);
      return matchesSearch && matchesFilter;
    });
  }, [filter, preview, search]);
  const missingKennelsByName = new Map<string, string>();
  for (const issue of preview?.issues ?? []) {
    if (
      issue.code === "DOG_BREEDER_NOT_FOUND" &&
      typeof issue.incomingValue === "string"
    ) {
      const name = issue.incomingValue.trim();
      missingKennelsByName.set(name.toLocaleLowerCase("fi-FI"), name);
    }
  }
  const missingKennels = [...missingKennelsByName.values()].sort((a, b) =>
    a.localeCompare(b, "fi"),
  );
  const labels = {
    ALL: "admin.dogs.import.review.rows",
    CREATE: "admin.dogs.import.review.create",
    UPDATE: "admin.dogs.import.review.update",
    UNCHANGED: "admin.dogs.import.review.unchanged",
    BLOCKED: "admin.dogs.import.review.blocked",
    WARNING: "admin.dogs.import.review.warnings",
    REFERENCE: "admin.dogs.import.review.reference",
  } as const;
  const issues = preview?.issues ?? [];
  const warnings = issues.filter((issue) => issue.severity === "WARNING");
  const blockers = issues.filter((issue) => issue.severity === "BLOCKER");
  const parents = issues.filter(
    (issue) => issue.resolution === "CREATE_REFERENCE",
  );
  const counts = {
    ALL: preview?.rowCount,
    CREATE: preview?.createCount,
    UPDATE: preview?.updateCount,
    UNCHANGED: preview?.unchangedCount,
    BLOCKED: blockers.length,
    WARNING: warnings.length,
    REFERENCE: parents.length,
  };
  const details =
    filter === "BLOCKED"
      ? blockers
      : filter === "WARNING"
        ? warnings
        : filter === "REFERENCE"
          ? parents
          : null;
  const visibleIssues = (
    details ??
    issues.filter(
      (issue) =>
        filter === "ALL" &&
        issue.sourceRowNumber === null &&
        issue.resolution !== "CREATE_REFERENCE",
    )
  ).filter(
    (issue) =>
      !search.trim() ||
      (issue.registrationNo ?? "")
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

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
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(labels) as Filter[]).map((value) => (
                      <Button
                        key={value}
                        size="sm"
                        variant={filter === value ? "default" : "outline"}
                        aria-pressed={filter === value}
                        onClick={() => {
                          setFilter(value);
                          setSearch("");
                        }}
                      >
                        {t(labels[value])} ({counts[value]})
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder={t("admin.dogs.import.review.search")}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("admin.dogs.import.review.explain")}
                  </p>
                  {filter === "BLOCKED" && missingKennels.length > 0 ? (
                    <div className="space-y-1 rounded-md border p-3 text-sm">
                      <p className="font-medium">
                        {t("admin.dogs.import.review.missingKennels")} (
                        {missingKennels.length})
                      </p>
                      <p>{missingKennels.join(", ")}</p>
                    </div>
                  ) : null}
                  {visibleIssues.map((issue, index) => (
                    <p
                      key={`${issue.code}-${index}`}
                      className="rounded border p-2 text-sm"
                    >
                      <strong>
                        {issue.registrationNo ??
                          t("admin.dogs.import.review.workbook")}
                      </strong>
                      {issue.sourceRowNumber !== null &&
                        ` · ${t("admin.dogs.import.review.row")} ${issue.sourceRowNumber}`}
                      {" · "}
                      {issue.resolution === "CREATE_REFERENCE" && issue.field
                        ? t(fieldLabels[issue.field])
                        : issueLabel(issue.code)}
                      {issue.currentValue != null &&
                        ` · ${t("admin.dogs.import.review.current")}: ${issue.currentValue}`}
                      {issue.incomingValue != null &&
                        ` · ${t("admin.dogs.import.review.incoming")}: ${issue.incomingValue}`}
                    </p>
                  ))}
                  <div className="divide-y text-sm">
                    {filteredRows.length === 0 && visibleIssues.length === 0 ? (
                      <p className="p-3 text-muted-foreground">
                        {filter === "WARNING" && !warnings.length
                          ? t("admin.dogs.import.review.noWarnings")
                          : t("admin.dogs.import.review.empty")}
                      </p>
                    ) : (
                      filteredRows.map((row) => (
                        <article
                          key={row.sourceRowNumber}
                          className="space-y-2 py-3"
                        >
                          <h3>
                            <span className="font-medium">
                              {row.registrationNo ?? "-"}
                            </span>{" "}
                            {row.name} · {t("admin.dogs.import.review.row")}{" "}
                            {row.sourceRowNumber} ·{" "}
                            {t(
                              `admin.dogs.import.status.${row.status}` as never,
                            )}{" "}
                          </h3>
                          <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                            {row.breederToLink ? (
                              <div>
                                {t("admin.dogs.import.review.breeder")}: — →{" "}
                                {row.breederToLink}
                              </div>
                            ) : null}
                            {row.changes?.map((change) => (
                              <div key={change.field}>
                                <span className="text-muted-foreground">
                                  {t(fieldLabels[change.field])}:{" "}
                                </span>
                                {row.status !== "CREATE" &&
                                  `${change.before ?? "—"} → `}
                                {change.field === "sex" &&
                                change.after === "MALE"
                                  ? t("admin.dogs.import.value.male")
                                  : change.field === "sex" &&
                                      change.after === "FEMALE"
                                    ? t("admin.dogs.import.value.female")
                                    : (change.after ?? "—")}
                              </div>
                            ))}
                          </div>
                          {row.issues.map((issue, index) => (
                            <div
                              key={`${issue.code}-${index}`}
                              className="rounded bg-muted/40 p-2"
                            >
                              <div className="font-medium">
                                {issueLabel(issue.code)}
                              </div>
                              <div>
                                {issue.field
                                  ? t(fieldLabels[issue.field])
                                  : "—"}
                                : {t("admin.dogs.import.review.current")}{" "}
                                {String(issue.currentValue ?? "-")} ·{" "}
                                {t("admin.dogs.import.review.incoming")}{" "}
                                {String(issue.incomingValue ?? "-")}
                              </div>
                            </div>
                          ))}
                        </article>
                      ))
                    )}
                  </div>
                  {!preview.hasChanges &&
                  !preview.issues.some(
                    (issue) => issue.severity === "BLOCKER",
                  ) ? (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.dogs.import.review.noChanges")}
                    </p>
                  ) : null}
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
                    {t("admin.dogs.import.review.create")}:{" "}
                    {preview.createCount} ·{" "}
                    {t("admin.dogs.import.review.update")}:{" "}
                    {preview.updateCount} ·{" "}
                    {t("admin.dogs.import.review.unchanged")}:{" "}
                    {preview.unchangedCount} ·{" "}
                    {t("admin.dogs.import.review.reference")}:{" "}
                    {preview.referenceCount}
                  </p>
                  <p className="text-sm">
                    {t("admin.dogs.import.confirm.noClearing")}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("review")}>
                      {t("admin.dogs.import.confirm.back")}
                    </Button>
                    <Button
                      disabled={!preview.applyAllowed || busy}
                      onClick={() => void apply()}
                    >
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
