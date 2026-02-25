"use client";

import { useMemo, useState } from "react";
import type { AdminDogListItem } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import { AdminMutationError } from "@/queries/admin";
import {
  useAdminDogBreederOptionsQuery,
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
import type { AdminDogFormValues, AdminDogRecord, AdminDogSex } from "./types";

type DogFormState = {
  open: boolean;
  mode: "create" | "edit";
  target: AdminDogRecord | null;
};

type DogParentOption = {
  registrationNo: string;
  name: string;
};

type NamedEntityOption = {
  id: string;
  name: string;
};

function createEmptyFormValues(): AdminDogFormValues {
  return {
    name: "",
    sex: "UNKNOWN",
    birthDate: "",
    breederNameText: "",
    ownershipNames: [],
    ekNo: "",
    note: "",
    registrationNo: "",
    sirePreviewName: "",
    sirePreviewRegistrationNo: "",
    damPreviewName: "",
    damPreviewRegistrationNo: "",
  };
}

function mapDogToFormValues(dog: AdminDogRecord): AdminDogFormValues {
  return {
    name: dog.name,
    sex: dog.sex,
    birthDate: dog.birthDate ?? "",
    breederNameText: dog.breederNameText ?? "",
    ownershipNames: dog.ownershipPreview,
    ekNo: dog.ekNo === null ? "" : String(dog.ekNo),
    note: dog.note ?? "",
    registrationNo: dog.registrationNo ?? "",
    sirePreviewName: dog.sirePreview?.name ?? "",
    sirePreviewRegistrationNo: dog.sirePreview?.registrationNo ?? "",
    damPreviewName: dog.damPreview?.name ?? "",
    damPreviewRegistrationNo: dog.damPreview?.registrationNo ?? "",
  };
}

function normalizeOptionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeEkNo(value: string): number | null {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapDogFromQuery(item: AdminDogListItem): AdminDogRecord {
  return {
    id: item.id,
    registrationNo: item.registrationNo,
    name: item.name,
    sex: item.sex,
    birthDate: item.birthDate,
    breederNameText: item.breederName,
    ownershipPreview: item.ownerNames,
    sirePreview: item.sire
      ? {
          name: item.sire.name,
          registrationNo: item.sire.registrationNo ?? "",
        }
      : null,
    damPreview: item.dam
      ? {
          name: item.dam.name,
          registrationNo: item.dam.registrationNo ?? "",
        }
      : null,
    trialCount: item.trialCount,
    showCount: item.showCount,
    ekNo: item.ekNo,
    note: item.note,
  };
}

export function AdminDogsPageClient() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [sex, setSex] = useState<"all" | AdminDogSex>("all");
  const [deletedDogIds, setDeletedDogIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminDogRecord | null>(null);
  const [formState, setFormState] = useState<DogFormState>({
    open: false,
    mode: "create",
    target: null,
  });
  const [formValues, setFormValues] = useState<AdminDogFormValues>(
    createEmptyFormValues,
  );
  const [breederLookupQuery, setBreederLookupQuery] = useState("");
  const [ownerLookupQuery, setOwnerLookupQuery] = useState("");
  const [parentLookupQuery, setParentLookupQuery] = useState("");

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
  const breederOptionsQuery = useAdminDogBreederOptionsQuery({
    query: breederLookupQuery,
    limit: 100,
    enabled: formState.open,
  });
  const ownerOptionsQuery = useAdminDogOwnerOptionsQuery({
    query: ownerLookupQuery,
    limit: 100,
    enabled: formState.open,
  });
  const parentOptionsQuery = useAdminDogParentOptionsQuery({
    query: parentLookupQuery,
    limit: 100,
    enabled: formState.open,
  });

  const baseDogs = useMemo(
    () => (dogsQuery.data?.items ?? []).map(mapDogFromQuery),
    [dogsQuery.data?.items],
  );
  const dogs = useMemo(() => {
    return baseDogs.filter((dog) => !deletedDogIds.has(dog.id));
  }, [baseDogs, deletedDogIds]);

  const breederOptions = useMemo(
    (): NamedEntityOption[] =>
      (breederOptionsQuery.data ?? []).map((option) => ({
        id: option.id,
        name: option.name,
      })),
    [breederOptionsQuery.data],
  );

  const ownerOptions = useMemo(
    (): NamedEntityOption[] =>
      (ownerOptionsQuery.data ?? []).map((option) => ({
        id: option.id,
        name: option.name,
      })),
    [ownerOptionsQuery.data],
  );

  const parentOptions = useMemo<DogParentOption[]>(
    () =>
      (parentOptionsQuery.data ?? [])
        .filter((option) => (option.registrationNo?.trim().length ?? 0) > 0)
        .map((option) => ({
          registrationNo: option.registrationNo ?? "",
          name: option.name,
        })),
    [parentOptionsQuery.data],
  );

  function openCreateModal() {
    setBreederLookupQuery("");
    setOwnerLookupQuery("");
    setParentLookupQuery("");
    setFormValues(createEmptyFormValues());
    setFormState({ open: true, mode: "create", target: null });
  }

  function openEditModal(dog: AdminDogRecord) {
    setBreederLookupQuery("");
    setOwnerLookupQuery("");
    setParentLookupQuery("");
    setFormValues(mapDogToFormValues(dog));
    setFormState({ open: true, mode: "edit", target: dog });
  }

  function closeFormModal() {
    setFormState((current) => ({ ...current, open: false }));
  }

  async function handleSubmit(values: AdminDogFormValues) {
    if (formState.mode === "create") {
      try {
        await createDogMutation.mutateAsync({
          name: values.name,
          sex: values.sex,
          birthDate: normalizeOptionalText(values.birthDate) ?? undefined,
          breederNameText:
            normalizeOptionalText(values.breederNameText) ?? undefined,
          ownerNames: values.ownershipNames,
          ekNo: normalizeEkNo(values.ekNo) ?? undefined,
          note: normalizeOptionalText(values.note) ?? undefined,
          registrationNo:
            normalizeOptionalText(values.registrationNo) ?? undefined,
          sireRegistrationNo:
            normalizeOptionalText(values.sirePreviewRegistrationNo) ??
            undefined,
          damRegistrationNo:
            normalizeOptionalText(values.damPreviewRegistrationNo) ?? undefined,
        });

        toast.success(t("admin.dogs.create.success"));
        setFormState({ open: false, mode: "create", target: null });
      } catch (error) {
        const message =
          error instanceof AdminMutationError
            ? error.message
            : "Failed to create dog.";
        toast.error(message);
      }
      return;
    }

    if (!formState.target) {
      return;
    }

    try {
      await updateDogMutation.mutateAsync({
        id: formState.target.id,
        name: values.name,
        sex: values.sex,
        birthDate: normalizeOptionalText(values.birthDate) ?? undefined,
        breederNameText:
          normalizeOptionalText(values.breederNameText) ?? undefined,
        ownerNames: values.ownershipNames,
        ekNo: normalizeEkNo(values.ekNo) ?? undefined,
        note: normalizeOptionalText(values.note) ?? undefined,
        registrationNo:
          normalizeOptionalText(values.registrationNo) ?? undefined,
        sireRegistrationNo:
          normalizeOptionalText(values.sirePreviewRegistrationNo) ?? undefined,
        damRegistrationNo:
          normalizeOptionalText(values.damPreviewRegistrationNo) ?? undefined,
      });

      toast.success(t("admin.dogs.edit.success"));
      setFormState({ open: false, mode: "create", target: null });
    } catch (error) {
      const message =
        error instanceof AdminMutationError
          ? error.message
          : "Failed to update dog.";
      toast.error(message);
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setDeletedDogIds((current) => {
      const next = new Set(current);
      next.add(deleteTarget.id);
      return next;
    });
    toast.success(t("admin.dogs.delete.success"));
    setDeleteTarget(null);
  }

  const resultCount = dogs.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.dogs.title")}
        </h1>
        <Button type="button" onClick={openCreateModal}>
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
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
            />
          ) : null}
        </div>
      </ListingSectionShell>

      <DogFormModal
        open={formState.open}
        mode={formState.mode}
        dog={formState.target}
        values={formValues}
        breederOptions={breederOptions}
        ownerOptions={ownerOptions}
        parentOptions={parentOptions}
        onBreederSearchChange={setBreederLookupQuery}
        onOwnerSearchChange={setOwnerLookupQuery}
        onParentSearchChange={setParentLookupQuery}
        onClose={closeFormModal}
        onValuesChange={setFormValues}
        onSubmit={handleSubmit}
        isSubmitting={
          createDogMutation.isPending || updateDogMutation.isPending
        }
      />

      <DeleteDogConfirmModal
        dog={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
