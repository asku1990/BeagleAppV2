"use client";

import type { AdminDogListRequest, DogStatus } from "@beagle/contracts";
import { useMemo, useState } from "react";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { useAdminDogFormFlow } from "@/hooks/admin/dogs/manage";
import {
  mapAdminDogFromQuery,
  toAdminDogOwnerOptions,
  toAdminDogParentOptions,
} from "@/lib/admin/dogs/manage";
import { formatDogColor } from "@/lib/dogs/color";
import {
  useAdminDogColorOptionsQuery,
  useDeleteAdminDogMutation,
  useAdminDogDeleteImpactQuery,
  useAdminDogOwnerOptionsQuery,
  useAdminDogParentOptionsQuery,
  useAdminDogsQuery,
  useCalculateAdminDogInbreedingMutation,
  useCreateAdminDogMutation,
  useUpdateAdminDogMutation,
} from "@/queries/admin/dogs";
import { DeleteDogConfirmModal } from "./delete-dog-confirm-modal";
import { DogFilters } from "./dog-filters";
import { DogFormModal } from "./dog-form-modal";
import { DogResults } from "./dog-results";
import type { AdminDogSex } from "./types";

const DEFAULT_DOG_FILTERS = {
  page: 1,
  pageSize: 50,
  sort: "name-asc",
} satisfies AdminDogListRequest;

export function AdminDogsPageClient() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [sex, setSex] = useState<"all" | AdminDogSex>("all");
  const [status, setStatus] = useState<"all" | DogStatus>("all");
  const [filters, setFilters] = useState<AdminDogListRequest>(() => ({
    ...DEFAULT_DOG_FILTERS,
  }));

  function handleSearch() {
    setFilters({
      query: query.trim().length > 0 ? query.trim() : undefined,
      sex: sex === "all" ? undefined : sex,
      status: status === "all" ? undefined : status,
      ...DEFAULT_DOG_FILTERS,
    });
  }

  function handleResetSearch() {
    setQuery("");
    setSex("all");
    setStatus("all");
    setFilters({ ...DEFAULT_DOG_FILTERS });
  }

  const dogsQuery = useAdminDogsQuery(filters);
  const calculateInbreedingMutation = useCalculateAdminDogInbreedingMutation();
  const createDogMutation = useCreateAdminDogMutation();
  const updateDogMutation = useUpdateAdminDogMutation();
  const deleteDogMutation = useDeleteAdminDogMutation();

  const dogFormFlow = useAdminDogFormFlow({
    t,
    calculateInbreedingMutation,
    createDogMutation,
    updateDogMutation,
    deleteDogMutation,
  });

  const deleteImpactQuery = useAdminDogDeleteImpactQuery({
    dogId: dogFormFlow.deleteTarget?.id ?? null,
    enabled: Boolean(dogFormFlow.deleteTarget),
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
  const colorOptionsQuery = useAdminDogColorOptionsQuery(
    dogFormFlow.formState.open,
  );

  const dogs = useMemo(
    () => (dogsQuery.data?.items ?? []).map(mapAdminDogFromQuery),
    [dogsQuery.data?.items],
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
  const colorOptions = useMemo(
    () =>
      (colorOptionsQuery.data ?? [])
        .filter(
          (option) =>
            option.status === "SELECTABLE" ||
            String(option.code) === dogFormFlow.formValues.colorCode,
        )
        .map((option) => {
          const localizedName =
            formatDogColor(option, locale) ?? String(option.code);
          const hiddenSuffix =
            option.status === "SELECTABLE"
              ? ""
              : locale === "sv"
                ? " (dold)"
                : " (piilotettu)";

          return {
            value: String(option.code),
            label: `${option.code} - ${localizedName}${hiddenSuffix}`,
            keywords: [
              String(option.code),
              option.nameFi,
              option.nameSv ?? "",
              option.nameEn ?? "",
            ],
          };
        }),
    [colorOptionsQuery.data, dogFormFlow.formValues.colorCode, locale],
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
            status={status}
            isPending={dogsQuery.isFetching}
            onQueryChange={setQuery}
            onSexChange={setSex}
            onStatusChange={setStatus}
            onSubmit={handleSearch}
            onReset={handleResetSearch}
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
        formStatus={dogFormFlow.formStatus}
        colorOptions={colorOptions}
        ownerOptions={ownerOptions}
        parentOptions={parentOptions}
        onOwnerSearchChange={dogFormFlow.setOwnerLookupQuery}
        onParentSearchChange={dogFormFlow.setParentLookupQuery}
        onClose={dogFormFlow.closeFormModal}
        onValuesChange={dogFormFlow.setFormValues}
        onFormStatusChange={dogFormFlow.setFormStatus}
        onSubmit={dogFormFlow.handleSubmit}
        onCalculateInbreeding={dogFormFlow.handleCalculateInbreeding}
        isCalculatingInbreeding={dogFormFlow.isCalculatingInbreeding}
        isSubmitting={dogFormFlow.isSubmitting}
      />

      <DeleteDogConfirmModal
        dog={dogFormFlow.deleteTarget}
        impact={deleteImpactQuery.data ?? null}
        isImpactLoading={deleteImpactQuery.isLoading}
        isImpactError={deleteImpactQuery.isError}
        onCancel={() => dogFormFlow.setDeleteTarget(null)}
        onConfirm={dogFormFlow.handleDeleteConfirm}
        isDeleting={dogFormFlow.isDeleting}
      />
    </div>
  );
}
