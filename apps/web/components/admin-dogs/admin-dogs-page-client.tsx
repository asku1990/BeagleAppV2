"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { DeleteDogConfirmModal } from "./delete-dog-confirm-modal";
import { DogFilters } from "./dog-filters";
import { DogFormModal } from "./dog-form-modal";
import { DogResults } from "./dog-results";
import { mockAdminDogs } from "./mock-dogs";
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

function toSearchText(dog: AdminDogRecord): string {
  return [
    dog.registrationNo ?? "",
    dog.name,
    dog.breederNameText ?? "",
    dog.ownershipPreview.join(" "),
    dog.sirePreview?.name ?? "",
    dog.sirePreview?.registrationNo ?? "",
    dog.damPreview?.name ?? "",
    dog.damPreview?.registrationNo ?? "",
    dog.ekNo === null ? "" : String(dog.ekNo),
    dog.note ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function AdminDogsPageClient() {
  const { t } = useI18n();
  const [dogs, setDogs] = useState<AdminDogRecord[]>(mockAdminDogs);
  const [query, setQuery] = useState("");
  const [sex, setSex] = useState<"all" | AdminDogSex>("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminDogRecord | null>(null);
  const [formState, setFormState] = useState<DogFormState>({
    open: false,
    mode: "create",
    target: null,
  });
  const [formValues, setFormValues] = useState<AdminDogFormValues>(
    createEmptyFormValues,
  );

  const filteredDogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return dogs.filter((dog) => {
      const matchesSex = sex === "all" || dog.sex === sex;
      if (!matchesSex) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      return toSearchText(dog).includes(normalizedQuery);
    });
  }, [dogs, query, sex]);

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
      setDogs((current) => [nextDog, ...current]);
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
    setDogs((current) =>
      current.map((dog) => (dog.id === formState.target?.id ? nextDog : dog)),
    );
    toast.success(t("admin.dogs.edit.success"));
    setFormState({ open: false, mode: "create", target: null });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setDogs((current) => current.filter((dog) => dog.id !== deleteTarget.id));
    toast.success(t("admin.dogs.delete.success"));
    setDeleteTarget(null);
  }

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
            {t("admin.dogs.management.countPrefix")} {filteredDogs.length}
          </p>
          <DogResults
            dogs={filteredDogs}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
          />
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
