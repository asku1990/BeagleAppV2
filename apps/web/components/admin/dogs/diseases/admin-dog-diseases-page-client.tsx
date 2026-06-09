"use client";

import { useMemo, useState } from "react";
import type {
  AdminDogDiseaseBrowseItem,
  AdminDogDiseaseBrowseResponse,
} from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { toast } from "@/components/ui/sonner";
import { useAdminDogDiseasesUiState } from "@/hooks/admin/dogs/diseases";
import {
  useAdminDogDiseasesQuery,
  useCreateAdminDogDiseaseMutation,
  useDeleteAdminDogDiseaseMutation,
} from "@/queries/admin/dogs";
import { CreateDiseaseModal } from "./internal/create-disease-modal";
import { mapDiseaseGroupOptions } from "./internal/disease-group-options";
import { DiseaseResults } from "./internal/disease-results";
import { DiseaseSearchForm } from "./internal/disease-search-form";
import { useDiseasePageLabels } from "./internal/use-disease-page-labels";

type Props = {
  initialData?: AdminDogDiseaseBrowseResponse | null;
};

export function AdminDogDiseasesPageClient({ initialData }: Props) {
  const labels = useDiseasePageLabels();
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

  const diseaseGroupOptions = useMemo(
    () =>
      mapDiseaseGroupOptions({
        data,
        allDiseaseCount,
        allGroupLabel: labels.allGroupFilterLabel,
        countSuffix: labels.countSuffix,
        groupLabels: labels.groups,
      }),
    [
      allDiseaseCount,
      data,
      labels.allGroupFilterLabel,
      labels.countSuffix,
      labels.groups,
    ],
  );

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
                {labels.pagination.previous}
              </Button>
              <span>
                {labels.pagination.page} {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => setPage(currentPage + 1)}
              >
                {labels.pagination.next}
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
