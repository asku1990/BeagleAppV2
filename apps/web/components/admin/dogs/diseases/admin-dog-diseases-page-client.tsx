"use client";

import { useMemo, useState } from "react";
import type { AdminDogDiseaseBrowseResponse } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { toast } from "@/components/ui/sonner";
import { useAdminDogDiseasesUiState } from "@/hooks/admin/dogs/diseases";
import { useI18n } from "@/hooks/i18n";
import {
  useAdminDogDiseasesQuery,
  useCreateAdminDogDiseaseMutation,
} from "@/queries/admin/dogs";
import { CreateDiseaseModal } from "./internal/create-disease-modal";
import { DiseaseResults } from "./internal/disease-results";

type Props = {
  initialData?: AdminDogDiseaseBrowseResponse | null;
};

export function AdminDogDiseasesPageClient({ initialData }: Props) {
  const { t } = useI18n();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
  const createDiseaseMutation = useCreateAdminDogDiseaseMutation();

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
      create: {
        open: t("admin.dogs.diseases.create.open"),
        title: t("admin.dogs.diseases.create.title"),
        aria: t("admin.dogs.diseases.create.aria"),
        mode: t("admin.dogs.diseases.create.mode"),
        modeDog: t("admin.dogs.diseases.create.modeDog"),
        modeLitter: t("admin.dogs.diseases.create.modeLitter"),
        disease: t("admin.dogs.diseases.create.disease"),
        registration: t("admin.dogs.diseases.create.registration"),
        sire: t("admin.dogs.diseases.create.sire"),
        dam: t("admin.dogs.diseases.create.dam"),
        litter: t("admin.dogs.diseases.create.litter"),
        description: t("admin.dogs.diseases.create.description"),
        source: t("admin.dogs.diseases.create.source"),
        public: t("admin.dogs.diseases.create.public"),
        publicNo: t("admin.dogs.diseases.create.publicNo"),
        publicYes: t("admin.dogs.diseases.create.publicYes"),
        save: t("admin.dogs.diseases.create.save"),
        saving: t("admin.dogs.diseases.create.saving"),
        cancel: t("admin.dogs.diseases.create.cancel"),
        success: t("admin.dogs.diseases.create.success"),
        error: t("admin.dogs.diseases.create.error"),
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-sm flex-1">
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
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              {labels.create.open}
            </Button>
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

      {isCreateOpen ? (
        <CreateDiseaseModal
          open={isCreateOpen}
          diseaseOptions={
            data?.diseaseOptions ?? initialData?.diseaseOptions ?? []
          }
          selectedDiseaseCode={data?.selectedDiseaseCode ?? initialDiseaseCode}
          labels={labels.create}
          isSubmitting={createDiseaseMutation.isPending}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={async (input) => {
            try {
              await createDiseaseMutation.mutateAsync(input);
              toast.success(labels.create.success);
              setIsCreateOpen(false);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : labels.create.error,
              );
            }
          }}
        />
      ) : null}
    </div>
  );
}
