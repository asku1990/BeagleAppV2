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
import { mapDiseaseCodeOptions } from "./internal/disease-code-options";
import { DiseaseResults } from "./internal/disease-results";
import { DiseaseSearchForm } from "./internal/disease-search-form";
import { resolveCreateDiseaseSelectedCode } from "./internal/create-disease-form-state";
import { useDiseasePageLabels } from "./internal/use-disease-page-labels";

type Props = {
  initialData?: AdminDogDiseaseBrowseResponse | null;
};

export function AdminDogDiseasesPageClient({ initialData }: Props) {
  const labels = useDiseasePageLabels();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminDogDiseaseBrowseItem | null>(null);
  const {
    diseaseCode,
    query: submittedQuery,
    page,
    isPending,
    submitSearch,
    setPage,
  } = useAdminDogDiseasesUiState({
    initialDiseaseCode: initialData?.selectedDiseaseCode ?? "epi",
  });

  const queryInitialData = useMemo(() => {
    if (!initialData) {
      return undefined;
    }

    if (initialData.selectedDiseaseCode !== (diseaseCode ?? null)) {
      return undefined;
    }

    if (initialData.query !== submittedQuery) {
      return undefined;
    }

    if (initialData.page !== page) {
      return undefined;
    }

    return initialData;
  }, [diseaseCode, initialData, page, submittedQuery]);

  const query = useAdminDogDiseasesQuery({
    diseaseCode,
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

  const diseaseCodeOptions = useMemo(
    () =>
      mapDiseaseCodeOptions({
        data,
        allFilterLabel: labels.allFilterLabel,
        countSuffix: labels.countSuffix,
      }),
    [data, labels.allFilterLabel, labels.countSuffix],
  );

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {labels.pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {labels.summaryPrefix} {total} {labels.summarySuffix}.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          {labels.create.open}
        </Button>
      </div>

      <ListingSectionShell title={labels.sectionTitle}>
        <div className="space-y-4">
          <DiseaseSearchForm
            key={`${diseaseCode ?? "all"}:${submittedQuery}`}
            diseaseCode={diseaseCode ?? null}
            query={submittedQuery}
            diseaseCodeOptions={diseaseCodeOptions}
            isPending={isPending}
            labels={{
              filterLabel: labels.filterLabel,
              queryLabel: labels.queryLabel,
              queryPlaceholder: labels.queryPlaceholder,
              searchButton: labels.searchButton,
            }}
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
          selectedDiseaseCode={resolveCreateDiseaseSelectedCode(
            data?.selectedDiseaseCode,
            diseaseCode,
          )}
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
