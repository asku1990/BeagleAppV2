"use client";

import { useMemo, useState } from "react";
import type { AdminDogListItem } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import { useAdminDogsQuery } from "@/queries/admin/dogs";
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

function toRecord(
  values: AdminDogFormValues,
  id: string,
  counts?: { trialCount: number; showCount: number },
): AdminDogRecord {
  return {
    id,
    name: values.name.trim(),
    sex: values.sex,
    birthDate: normalizeOptionalText(values.birthDate),
    breederNameText: normalizeOptionalText(values.breederNameText),
    trialCount: counts?.trialCount ?? 0,
    showCount: counts?.showCount ?? 0,
    ownershipPreview: values.ownershipNames,
    ekNo: normalizeEkNo(values.ekNo),
    note: normalizeOptionalText(values.note),
    registrationNo: normalizeOptionalText(values.registrationNo),
    sirePreview:
      normalizeOptionalText(values.sirePreviewName) ||
      normalizeOptionalText(values.sirePreviewRegistrationNo)
        ? {
            name: values.sirePreviewName.trim(),
            registrationNo: values.sirePreviewRegistrationNo.trim(),
          }
        : null,
    damPreview:
      normalizeOptionalText(values.damPreviewName) ||
      normalizeOptionalText(values.damPreviewRegistrationNo)
        ? {
            name: values.damPreviewName.trim(),
            registrationNo: values.damPreviewRegistrationNo.trim(),
          }
        : null,
  };
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
  const [createdDogs, setCreatedDogs] = useState<AdminDogRecord[]>([]);
  const [updatedDogsById, setUpdatedDogsById] = useState<
    Record<string, AdminDogRecord>
  >({});
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

  const baseDogs = useMemo(
    () => (dogsQuery.data?.items ?? []).map(mapDogFromQuery),
    [dogsQuery.data?.items],
  );
  const dogs = useMemo(() => {
    const mergedBaseDogs = baseDogs
      .filter((dog) => !deletedDogIds.has(dog.id))
      .map((dog) => updatedDogsById[dog.id] ?? dog);

    return [...createdDogs, ...mergedBaseDogs];
  }, [baseDogs, createdDogs, deletedDogIds, updatedDogsById]);

  const breederOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dogs
            .map((dog) => dog.breederNameText?.trim() ?? "")
            .filter((breederName) => breederName.length > 0),
        ),
      ),
    [dogs],
  );

  const ownerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dogs.flatMap((dog) =>
            dog.ownershipPreview
              .map((ownerName) => ownerName.trim())
              .filter((ownerName) => ownerName.length > 0),
          ),
        ),
      ),
    [dogs],
  );

  const parentOptions = useMemo<DogParentOption[]>(
    () =>
      dogs
        .filter((dog) => (dog.registrationNo?.trim().length ?? 0) > 0)
        .map((dog) => ({
          registrationNo: dog.registrationNo ?? "",
          name: dog.name,
        })),
    [dogs],
  );

  function openCreateModal() {
    setFormValues(createEmptyFormValues());
    setFormState({ open: true, mode: "create", target: null });
  }

  function openEditModal(dog: AdminDogRecord) {
    setFormValues(mapDogToFormValues(dog));
    setFormState({ open: true, mode: "edit", target: dog });
  }

  function closeFormModal() {
    setFormState((current) => ({ ...current, open: false }));
  }

  function handleSubmit(values: AdminDogFormValues) {
    if (formState.mode === "create") {
      const nextDog = toRecord(values, `dog-${Date.now()}`);
      setCreatedDogs((current) => [nextDog, ...current]);
      toast.success(t("admin.dogs.create.success"));
      setFormState({ open: false, mode: "create", target: null });
      return;
    }

    if (!formState.target) {
      return;
    }

    const nextDog = toRecord(values, formState.target.id, {
      trialCount: formState.target.trialCount,
      showCount: formState.target.showCount,
    });
    const targetId = formState.target.id;

    if (targetId.startsWith("dog-")) {
      setCreatedDogs((current) =>
        current.map((dog) => (dog.id === targetId ? nextDog : dog)),
      );
    } else {
      setUpdatedDogsById((current) => ({
        ...current,
        [targetId]: nextDog,
      }));
    }

    toast.success(t("admin.dogs.edit.success"));
    setFormState({ open: false, mode: "create", target: null });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.id.startsWith("dog-")) {
      setCreatedDogs((current) =>
        current.filter((dog) => dog.id !== deleteTarget.id),
      );
    } else {
      setDeletedDogIds((current) => {
        const next = new Set(current);
        next.add(deleteTarget.id);
        return next;
      });
      setUpdatedDogsById((current) => {
        const next = { ...current };
        delete next[deleteTarget.id];
        return next;
      });
    }

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
        onClose={closeFormModal}
        onValuesChange={setFormValues}
        onSubmit={handleSubmit}
      />

      <DeleteDogConfirmModal
        dog={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
