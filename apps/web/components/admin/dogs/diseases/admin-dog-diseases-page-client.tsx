"use client";

import { useMemo } from "react";
import type { AdminDogDiseaseBrowseResponse } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { useAdminDogDiseasesUiState } from "@/hooks/admin/dogs/diseases";
import { useI18n } from "@/hooks/i18n";
import { useAdminDogDiseasesQuery } from "@/queries/admin/dogs";
import { DiseaseResults } from "./internal/disease-results";

type Props = {
  initialData?: AdminDogDiseaseBrowseResponse | null;
};

export function AdminDogDiseasesPageClient({ initialData }: Props) {
  const { t } = useI18n();
  const initialDiseaseCode = initialData
    ? initialData.selectedDiseaseCode
    : "epi";
  const { diseaseCode, page, isPending, setDiseaseCode, setPage } =
    useAdminDogDiseasesUiState({
      initialDiseaseCode,
    });

  const queryInitialData = useMemo(() => {
    if (!initialData) {
      return undefined;
    }

    if (initialData.selectedDiseaseCode !== diseaseCode) {
      return undefined;
    }

    if (initialData.page !== page) {
      return undefined;
    }

    return initialData;
  }, [diseaseCode, initialData, page]);

  const query = useAdminDogDiseasesQuery({
    diseaseCode,
    page,
    initialData: queryInitialData,
  });

  const data = query.data ?? queryInitialData ?? null;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? page;
  const allDiseaseCount = useMemo(() => {
    return (
      data?.diseaseOptions.reduce((sum, option) => sum + option.count, 0) ?? 0
    );
  }, [data?.diseaseOptions]);

  const labels = useMemo(
    () => ({
      pageTitle: t("admin.dogs.diseases.page.title"),
      sectionTitle: t("admin.dogs.diseases.section.title"),
      filterLabel: t("admin.dogs.diseases.filter.label"),
      allFilterLabel: t("admin.dogs.diseases.filter.all"),
      countSuffix: t("admin.dogs.diseases.countSuffix"),
      summaryPrefix: t("admin.dogs.diseases.summary.prefix"),
      summarySuffix: t("admin.dogs.diseases.summary.suffix"),
      loading: t("admin.dogs.diseases.loading"),
      error: t("admin.dogs.diseases.error"),
      empty: t("admin.dogs.diseases.empty"),
      public: {
        yes: t("admin.dogs.diseases.public.yes"),
        no: t("admin.dogs.diseases.public.no"),
      },
      unknownName: t("admin.dogs.diseases.unknownName"),
      sex: {
        male: t("admin.dogs.sex.male"),
        female: t("admin.dogs.sex.female"),
        unknown: t("admin.dogs.sex.unknown"),
      },
      parents: {
        sire: "I",
        dam: "E",
      },
      tableHeaders: {
        disease: t("admin.dogs.diseases.columns.disease"),
        public: t("admin.dogs.diseases.columns.public"),
        registration: t("admin.dogs.diseases.columns.registration"),
        sex: t("admin.dogs.diseases.columns.sex"),
        name: t("admin.dogs.diseases.columns.name"),
        counts: t("admin.dogs.diseases.columns.counts"),
        other: t("admin.dogs.diseases.columns.other"),
      },
      cardLabels: {
        public: t("admin.dogs.diseases.card.public"),
        registration: t("admin.dogs.diseases.card.registration"),
        sex: t("admin.dogs.diseases.card.sex"),
        name: t("admin.dogs.diseases.card.name"),
        counts: t("admin.dogs.diseases.card.counts"),
        other: t("admin.dogs.diseases.card.other"),
      },
    }),
    [t],
  );

  const diseaseOptions = useMemo(() => {
    const options = data?.diseaseOptions ?? [];
    return [
      {
        diseaseCode: "all",
        diseaseText: labels.allFilterLabel,
        count: allDiseaseCount,
      },
      ...options,
    ].map((option) => ({
      ...option,
      label: `${option.diseaseText} ${option.count} ${labels.countSuffix}`,
    }));
  }, [
    allDiseaseCount,
    data?.diseaseOptions,
    labels.allFilterLabel,
    labels.countSuffix,
  ]);

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {labels.pageTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {labels.summaryPrefix} {total} {labels.summarySuffix}.
        </p>
      </div>

      <ListingSectionShell title={labels.sectionTitle}>
        <div className="space-y-4">
          <div className="max-w-sm">
            <LabeledSelect
              label={labels.filterLabel}
              value={diseaseCode ?? "all"}
              disabled={isPending}
              onChange={(event) => {
                setDiseaseCode(
                  event.target.value === "all" ? null : event.target.value,
                );
              }}
            >
              {diseaseOptions.map((option) => (
                <option key={option.diseaseCode} value={option.diseaseCode}>
                  {option.label}
                </option>
              ))}
            </LabeledSelect>
          </div>

          {query.isLoading ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {labels.loading}
              </CardContent>
            </Card>
          ) : null}

          {query.isError ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {query.error instanceof Error
                  ? query.error.message
                  : labels.error}
              </CardContent>
            </Card>
          ) : null}

          {!query.isLoading && !query.isError ? (
            <DiseaseResults items={items} labels={labels} />
          ) : null}

          {totalPages > 1 && !query.isLoading && !query.isError ? (
            <div className="flex items-center gap-2 text-sm">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isPending}
                onClick={() => setPage(currentPage - 1)}
              >
                {t("admin.dogs.diseases.pagination.previous")}
              </Button>
              <span>
                {t("admin.dogs.diseases.pagination.page")} {currentPage} /{" "}
                {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => setPage(currentPage + 1)}
              >
                {t("admin.dogs.diseases.pagination.next")}
              </Button>
            </div>
          ) : null}
        </div>
      </ListingSectionShell>
    </div>
  );
}
