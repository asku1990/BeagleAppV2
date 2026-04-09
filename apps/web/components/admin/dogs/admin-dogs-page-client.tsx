"use client";

import { useMemo, useState } from "react";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { useAdminDogFormFlow } from "@/hooks/admin/dogs/manage";
import {
  mapAdminDogFromQuery,
  toAdminDogBreederOptions,
  toAdminDogOwnerOptions,
  toAdminDogParentOptions,
} from "@/lib/admin/dogs/manage";
import {
  useAdminDogBreederOptionsQuery,
  useDeleteAdminDogMutation,
  useAdminDogOwnerOptionsQuery,
  useAdminDogParentOptionsQuery,
  useAdminDogsQuery,
  useCreateAdminDogMutation,
  useUpdateAdminDogMutation,
} from "@/queries/admin/dogs";
import { DeleteDogConfirmModal } from "./delete-dog-confirm-modal";
import { DogFilters } from "./dog-filters";
import { DogFormModal } from "./dog-form-modal";
import { DogResults } from "./dog-results";
import type { AdminDogSex } from "./types";

export function AdminDogsPageClient() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [sex, setSex] = useState<"all" | AdminDogSex>("all");

  const filters = useMemo(
    () => ({
      query: query.trim().length > 0 ? query.trim() : undefined,
      sex: sex === "all" ? undefined : sex,
      page: 1,
      pageSize: 50,
      sort: "name-asc" as const,
    }),
    [query, sex],
  );

  const dogsQuery = useAdminDogsQuery(filters);
  const createDogMutation = useCreateAdminDogMutation();
  const updateDogMutation = useUpdateAdminDogMutation();
  const deleteDogMutation = useDeleteAdminDogMutation();

  const dogFormFlow = useAdminDogFormFlow({
    t,
    createDogMutation,
    updateDogMutation,
    deleteDogMutation,
  });

  const breederOptionsQuery = useAdminDogBreederOptionsQuery({
    query: dogFormFlow.breederLookupQuery,
    limit: 100,
    enabled: dogFormFlow.formState.open,
  });
  const ownerOptionsQuery = useAdminDogOwnerOptionsQuery({
    query: dogFormFlow.ownerLookupQuery,
    limit: 100,
    enabled: dogFormFlow.formState.open,
  });
  const parentOptionsQuery = useAdminDogParentOptionsQuery({
    query: dogFormFlow.parentLookupQuery,
    limit: 100,
    enabled: dogFormFlow.formState.open,
  });

  const dogs = useMemo(
    () => (dogsQuery.data?.items ?? []).map(mapAdminDogFromQuery),
    [dogsQuery.data?.items],
  );

  const breederOptions = useMemo(
    () =>
      toAdminDogBreederOptions(
        breederOptionsQuery.data,
        dogFormFlow.formValues.breederNameText,
      ),
    [breederOptionsQuery.data, dogFormFlow.formValues.breederNameText],
  );

  const ownerOptions = useMemo(
    () => toAdminDogOwnerOptions(ownerOptionsQuery.data),
    [ownerOptionsQuery.data],
  );

  const parentOptions = useMemo(
    () =>
      toAdminDogParentOptions(parentOptionsQuery.data, {
        sirePreviewRegistrationNo:
          dogFormFlow.formValues.sirePreviewRegistrationNo,
        sirePreviewName: dogFormFlow.formValues.sirePreviewName,
        damPreviewRegistrationNo:
          dogFormFlow.formValues.damPreviewRegistrationNo,
        damPreviewName: dogFormFlow.formValues.damPreviewName,
      }),
    [
      parentOptionsQuery.data,
      dogFormFlow.formValues.sirePreviewRegistrationNo,
      dogFormFlow.formValues.sirePreviewName,
      dogFormFlow.formValues.damPreviewRegistrationNo,
      dogFormFlow.formValues.damPreviewName,
    ],
  );

  const resultCount = dogs.length;

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.dogs.title")}
        </h1>
        <Button type="button" onClick={dogFormFlow.openCreateModal}>
          {t("admin.dogs.create.button")}
        </Button>
      </div>

      <ListingSectionShell title={t("admin.dogs.management.title")}>
        <div className="space-y-4">
          <DogFilters
            query={query}
            sex={sex}
            onQueryChange={setQuery}
            onSexChange={setSex}
          />
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.management.countPrefix")} {resultCount}
          </p>
          {dogsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t("admin.dogs.loading")}
            </p>
          ) : null}
          {dogsQuery.isError ? (
            <p className="text-sm text-destructive">{t("admin.dogs.error")}</p>
          ) : null}
          {!dogsQuery.isLoading ? (
            <DogResults
              dogs={dogs}
              onEdit={dogFormFlow.openEditModal}
              onDelete={dogFormFlow.setDeleteTarget}
            />
          ) : null}
        </div>
      </ListingSectionShell>

      <DogFormModal
        open={dogFormFlow.formState.open}
        mode={dogFormFlow.formState.mode}
        dog={dogFormFlow.formState.target}
        values={dogFormFlow.formValues}
        breederOptions={breederOptions}
        ownerOptions={ownerOptions}
        parentOptions={parentOptions}
        onBreederSearchChange={dogFormFlow.setBreederLookupQuery}
        onOwnerSearchChange={dogFormFlow.setOwnerLookupQuery}
        onParentSearchChange={dogFormFlow.setParentLookupQuery}
        onClose={dogFormFlow.closeFormModal}
        onValuesChange={dogFormFlow.setFormValues}
        onSubmit={dogFormFlow.handleSubmit}
        isSubmitting={dogFormFlow.isSubmitting}
      />

      <DeleteDogConfirmModal
        dog={dogFormFlow.deleteTarget}
        onCancel={() => dogFormFlow.setDeleteTarget(null)}
        onConfirm={dogFormFlow.handleDeleteConfirm}
        isDeleting={dogFormFlow.isDeleting}
      />
    </div>
  );
}
