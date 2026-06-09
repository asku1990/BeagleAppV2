"use client";

import { useMemo, useState, type FormEvent } from "react";
import type {
  AdminDogDiseaseGroup,
  AdminDogDiseaseBrowseItem,
  AdminDogDiseaseBrowseResponse,
} from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { LabeledSelect } from "@/components/ui/form-fields/labeled-select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAdminDogDiseasesUiState } from "@/hooks/admin/dogs/diseases";
import { useI18n } from "@/hooks/i18n";
import {
  useAdminDogDiseasesQuery,
  useCreateAdminDogDiseaseMutation,
  useDeleteAdminDogDiseaseMutation,
} from "@/queries/admin/dogs";
import { CreateDiseaseModal } from "./internal/create-disease-modal";
import { DiseaseResults } from "./internal/disease-results";

type Props = {
  initialData?: AdminDogDiseaseBrowseResponse | null;
};

type DiseaseGroupOption = {
  diseaseGroup: AdminDogDiseaseGroup | "all";
  label: string;
};

type SearchFormProps = {
  diseaseGroup: AdminDogDiseaseGroup | null;
  query: string;
  diseaseGroupOptions: DiseaseGroupOption[];
  isPending: boolean;
  labels: {
    groupFilterLabel: string;
    queryLabel: string;
    queryPlaceholder: string;
    searchButton: string;
    createOpen: string;
  };
  onCreate: () => void;
  onSubmit: (input: {
    diseaseGroup: AdminDogDiseaseGroup | null;
    query: string;
  }) => void;
};

function DiseaseSearchForm({
  diseaseGroup,
  query,
  diseaseGroupOptions,
  isPending,
  labels,
  onCreate,
  onSubmit,
}: SearchFormProps) {
  const [draftDiseaseGroup, setDraftDiseaseGroup] =
    useState<AdminDogDiseaseGroup | null>(diseaseGroup);
  const [draftQuery, setDraftQuery] = useState(query);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      diseaseGroup: draftDiseaseGroup,
      query: draftQuery,
    });
  };

  return (
    <form
      className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
      onSubmit={handleSearchSubmit}
    >
      <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(14rem,20rem)_minmax(16rem,1fr)]">
        <LabeledSelect
          label={labels.groupFilterLabel}
          value={draftDiseaseGroup ?? "all"}
          disabled={isPending}
          onChange={(event) => {
            setDraftDiseaseGroup(
              event.target.value === "all"
                ? null
                : (event.target.value as AdminDogDiseaseGroup),
            );
          }}
        >
          {diseaseGroupOptions.map((option) => (
            <option key={option.diseaseGroup} value={option.diseaseGroup}>
              {option.label}
            </option>
          ))}
        </LabeledSelect>
        <label className="space-y-1 text-sm font-medium">
          <span>{labels.queryLabel}</span>
          <Input
            value={draftQuery}
            disabled={isPending}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder={labels.queryPlaceholder}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {labels.searchButton}
        </Button>
        <Button type="button" onClick={onCreate}>
          {labels.createOpen}
        </Button>
      </div>
    </form>
  );
}

export function AdminDogDiseasesPageClient({ initialData }: Props) {
  const { t } = useI18n();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminDogDiseaseBrowseItem | null>(null);
  const initialDiseaseGroup = initialData
    ? initialData.selectedDiseaseGroup
    : "EPILEPSIA";
  const {
    diseaseGroup,
    query: submittedQuery,
    page,
    isPending,
    submitSearch,
    setPage,
  } = useAdminDogDiseasesUiState({
    initialDiseaseGroup,
  });

  const queryInitialData = useMemo(() => {
    if (!initialData) {
      return undefined;
    }

    if (initialData.selectedDiseaseGroup !== diseaseGroup) {
      return undefined;
    }

    if (initialData.query !== submittedQuery) {
      return undefined;
    }

    if (initialData.page !== page) {
      return undefined;
    }

    return initialData;
  }, [diseaseGroup, initialData, page, submittedQuery]);

  const query = useAdminDogDiseasesQuery({
    diseaseGroup,
    query: submittedQuery,
    page,
    initialData: queryInitialData,
  });
  const createDiseaseMutation = useCreateAdminDogDiseaseMutation();
  const deleteDiseaseMutation = useDeleteAdminDogDiseaseMutation();

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
      groupFilterLabel: t("admin.dogs.diseases.filter.groupLabel"),
      allGroupFilterLabel: t("admin.dogs.diseases.filter.allGroups"),
      queryLabel: t("admin.dogs.diseases.filter.queryLabel"),
      queryPlaceholder: t("admin.dogs.diseases.filter.queryPlaceholder"),
      searchButton: t("admin.dogs.diseases.filter.search"),
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
      evidenceKind: {
        dog: t("admin.dogs.diseases.create.modeDog"),
        litter: t("admin.dogs.diseases.create.modeLitter"),
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
        evidenceKind: t("admin.dogs.diseases.columns.evidenceKind"),
        public: t("admin.dogs.diseases.columns.public"),
        registration: t("admin.dogs.diseases.columns.registration"),
        sex: t("admin.dogs.diseases.columns.sex"),
        name: t("admin.dogs.diseases.columns.name"),
        counts: t("admin.dogs.diseases.columns.counts"),
        metadata: t("admin.dogs.diseases.columns.metadata"),
        actions: t("admin.dogs.diseases.columns.actions"),
      },
      cardLabels: {
        public: t("admin.dogs.diseases.card.public"),
        registration: t("admin.dogs.diseases.card.registration"),
        sex: t("admin.dogs.diseases.card.sex"),
        name: t("admin.dogs.diseases.card.name"),
        counts: t("admin.dogs.diseases.card.counts"),
        litter: t("admin.dogs.diseases.create.litter"),
        description: t("admin.dogs.diseases.create.description"),
        source: t("admin.dogs.diseases.create.source"),
        other: t("admin.dogs.diseases.card.other"),
      },
      actions: {
        more: t("admin.dogs.diseases.actions.more"),
        delete: t("admin.dogs.diseases.actions.delete"),
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
      delete: {
        title: t("admin.dogs.diseases.delete.title"),
        descriptionPrefix: t("admin.dogs.diseases.delete.descriptionPrefix"),
        registrationLabel: t("admin.dogs.diseases.delete.registrationLabel"),
        dogLabel: t("admin.dogs.diseases.delete.dogLabel"),
        confirm: t("admin.dogs.diseases.delete.confirm"),
        confirming: t("admin.dogs.diseases.delete.confirming"),
        cancel: t("admin.dogs.diseases.delete.cancel"),
        aria: t("admin.dogs.diseases.delete.aria"),
        success: t("admin.dogs.diseases.delete.success"),
        error: t("admin.dogs.diseases.delete.error"),
      },
    }),
    [t],
  );

  const diseaseGroupOptions = useMemo<DiseaseGroupOption[]>(() => {
    const options = data?.diseaseGroupOptions ?? [];
    const groupLabels: Record<AdminDogDiseaseGroup, string> = {
      EPILEPSIA: t("admin.dogs.diseases.groups.epilepsia"),
      LAFORA: t("admin.dogs.diseases.groups.lafora"),
      PURENTA: t("admin.dogs.diseases.groups.purenta"),
      MLS: t("admin.dogs.diseases.groups.mls"),
      MUU: t("admin.dogs.diseases.groups.muu"),
    };
    const browseOptions: Array<{
      diseaseGroup: AdminDogDiseaseGroup | "all";
      diseaseText: string;
      count: number;
    }> = [
      {
        diseaseGroup: "all",
        diseaseText: labels.allGroupFilterLabel,
        count: allDiseaseCount,
      },
      ...options.map((option) => ({
        diseaseGroup: option.diseaseGroup,
        diseaseText: groupLabels[option.diseaseGroup],
        count: option.count,
      })),
    ];

    return browseOptions.map((option) => ({
      ...option,
      label: `${option.diseaseText} ${option.count} ${labels.countSuffix}`,
    }));
  }, [
    allDiseaseCount,
    data?.diseaseGroupOptions,
    labels.allGroupFilterLabel,
    labels.countSuffix,
    t,
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
          <DiseaseSearchForm
            key={`${diseaseGroup ?? "all"}:${submittedQuery}`}
            diseaseGroup={diseaseGroup}
            query={submittedQuery}
            diseaseGroupOptions={diseaseGroupOptions}
            isPending={isPending}
            labels={{
              groupFilterLabel: labels.groupFilterLabel,
              queryLabel: labels.queryLabel,
              queryPlaceholder: labels.queryPlaceholder,
              searchButton: labels.searchButton,
              createOpen: labels.create.open,
            }}
            onCreate={() => setIsCreateOpen(true)}
            onSubmit={submitSearch}
          />

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
            <DiseaseResults
              items={items}
              labels={labels}
              onDelete={setDeleteTarget}
            />
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
          selectedDiseaseCode={data?.selectedDiseaseCode ?? "epi"}
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

      {deleteTarget ? (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title={labels.delete.title}
          description={
            <div className="space-y-1">
              <p>
                {labels.delete.descriptionPrefix}{" "}
                <strong>{deleteTarget.diseaseText}</strong>.
              </p>
              <p>
                {labels.delete.registrationLabel}:{" "}
                <strong>{deleteTarget.registrationNo}</strong>
              </p>
              {deleteTarget.dogId ? (
                <p>
                  {labels.delete.dogLabel}: <strong>{deleteTarget.name}</strong>
                </p>
              ) : null}
            </div>
          }
          confirmLabel={labels.delete.confirm}
          cancelLabel={labels.delete.cancel}
          confirmVariant="destructive"
          isConfirming={deleteDiseaseMutation.isPending}
          confirmingLabel={labels.delete.confirming}
          ariaLabel={labels.delete.aria}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            try {
              await deleteDiseaseMutation.mutateAsync({ id: deleteTarget.id });
              toast.success(labels.delete.success);
              setDeleteTarget(null);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : labels.delete.error,
              );
            }
          }}
        />
      ) : null}
    </div>
  );
}
