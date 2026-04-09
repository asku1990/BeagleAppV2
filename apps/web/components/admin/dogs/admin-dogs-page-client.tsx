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
import { normalizeDateForInput } from "@/lib/admin/core/date";
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

function mergeNamedOption(
  options: NamedEntityOption[],
  name: string,
): NamedEntityOption[] {
  const normalizedName = name.trim();
  if (!normalizedName) {
    return options;
  }

  if (options.some((option) => option.name === normalizedName)) {
    return options;
  }

  return [
    { id: `selected:${normalizedName}`, name: normalizedName },
    ...options,
  ];
}

function mergeParentOption(
  options: DogParentOption[],
  option: DogParentOption | null,
): DogParentOption[] {
  if (!option) {
    return options;
  }

  const normalizedRegistrationNo = option.registrationNo.trim();
  const normalizedName = option.name.trim();
  if (!normalizedRegistrationNo || !normalizedName) {
    return options;
  }

  if (
    options.some((item) => item.registrationNo === normalizedRegistrationNo)
  ) {
    return options;
  }

  return [
    { registrationNo: normalizedRegistrationNo, name: normalizedName },
    ...options,
  ];
}

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
    secondaryRegistrationNos: [],
    sirePreviewName: "",
    sirePreviewRegistrationNo: "",
    damPreviewName: "",
    damPreviewRegistrationNo: "",
    titles: [],
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
    secondaryRegistrationNos: dog.secondaryRegistrationNos,
    sirePreviewName: dog.sirePreview?.name ?? "",
    sirePreviewRegistrationNo: dog.sirePreview?.registrationNo ?? "",
    damPreviewName: dog.damPreview?.name ?? "",
    damPreviewRegistrationNo: dog.damPreview?.registrationNo ?? "",
    titles: dog.titles.map((title) => ({
      awardedOn: title.awardedOn ?? "",
      titleCode: title.titleCode,
      titleName: title.titleName ?? "",
    })),
  };
}

function normalizeOptionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeParentRegistrationForUpdate(value: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : "";
}

function resolveParentRegistrationUpdateValue(
  currentValue: string,
  initialValue: string,
): string | null | undefined {
  const normalizedCurrent = normalizeParentRegistrationForUpdate(currentValue);
  const normalizedInitial = normalizeParentRegistrationForUpdate(initialValue);

  if (normalizedCurrent === normalizedInitial) {
    return undefined;
  }

  return normalizedCurrent.length > 0 ? normalizedCurrent : null;
}

function normalizeEkNo(value: string): number | null {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeSecondaryRegistrations(values: string[]): string[] {
  return values
    .map((value) => value.trim().toUpperCase())
    .filter((value) => value.length > 0);
}

function normalizeTitlesForMutation(
  values: AdminDogFormValues["titles"],
): Array<{
  awardedOn?: string | null;
  titleCode: string;
  titleName?: string | null;
  sortOrder: number;
}> {
  return values.map((title, index) => ({
    awardedOn: normalizeOptionalText(title.awardedOn),
    titleCode: title.titleCode.trim(),
    titleName: normalizeOptionalText(title.titleName),
    sortOrder: index,
  }));
}

function getMutationErrorCode(error: unknown): string | undefined {
  if (error instanceof AdminMutationError) {
    return error.errorCode;
  }

  return undefined;
}

function mapDogFromQuery(item: AdminDogListItem): AdminDogRecord {
  return {
    id: item.id,
    registrationNo: item.registrationNo,
    secondaryRegistrationNos: item.secondaryRegistrationNos,
    name: item.name,
    sex: item.sex,
    birthDate: normalizeDateForInput(item.birthDate),
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
    titles: (item.titles ?? []).map((title) => ({
      id: title.id,
      awardedOn: normalizeDateForInput(title.awardedOn),
      titleCode: title.titleCode,
      titleName: title.titleName,
      sortOrder: title.sortOrder,
    })),
  };
}

export function AdminDogsPageClient() {
  const { t } = useI18n();
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
  const deleteDogMutation = useDeleteAdminDogMutation();
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
  const dogs = useMemo(() => baseDogs, [baseDogs]);

  function getDogMutationErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case "INVALID_DOG_ID":
        return t("admin.dogs.mutation.errorInvalidDogId");
      case "INVALID_NAME":
        return t("admin.dogs.mutation.errorInvalidName");
      case "INVALID_REGISTRATION_NO":
        return t("admin.dogs.mutation.errorInvalidRegistrationNo");
      case "DUPLICATE_REGISTRATION_NO":
        return t("admin.dogs.mutation.errorDuplicateRegistrationNo");
      case "NAME_TOO_LONG":
        return t("admin.dogs.mutation.errorNameTooLong");
      case "INVALID_SEX":
        return t("admin.dogs.mutation.errorInvalidSex");
      case "INVALID_BIRTH_DATE":
        return t("admin.dogs.mutation.errorInvalidBirthDate");
      case "INVALID_EK_NO":
        return t("admin.dogs.mutation.errorInvalidEkNo");
      case "REGISTRATION_NO_TOO_LONG":
        return t("admin.dogs.mutation.errorRegistrationTooLong");
      case "NOTE_TOO_LONG":
        return t("admin.dogs.mutation.errorNoteTooLong");
      case "INVALID_SIRE_REGISTRATION":
        return t("admin.dogs.mutation.errorInvalidSireRegistration");
      case "INVALID_DAM_REGISTRATION":
        return t("admin.dogs.mutation.errorInvalidDamRegistration");
      case "INVALID_PARENT_COMBINATION":
        return t("admin.dogs.mutation.errorInvalidParentCombination");
      case "INVALID_SELF_PARENT":
        return t("admin.dogs.mutation.errorInvalidSelfParent");
      case "INVALID_SIRE_SEX":
        return t("admin.dogs.mutation.errorInvalidSireSex");
      case "INVALID_DAM_SEX":
        return t("admin.dogs.mutation.errorInvalidDamSex");
      case "DUPLICATE_DOG":
        return t("admin.dogs.mutation.errorDuplicateDog");
      case "DOG_NOT_FOUND":
        return t("admin.dogs.mutation.errorDogNotFound");
      case "INVALID_TITLE_CODE":
        return t("admin.dogs.mutation.errorInvalidTitleCode");
      case "INVALID_TITLE_AWARDED_ON":
        return t("admin.dogs.mutation.errorInvalidTitleAwardedOn");
      case "INVALID_TITLE_SORT_ORDER":
        return t("admin.dogs.mutation.errorInvalidTitleSortOrder");
      case "DUPLICATE_DOG_TITLE":
        return t("admin.dogs.mutation.errorDuplicateDogTitle");
      default:
        return t("admin.dogs.mutation.errorDefault");
    }
  }

  const breederOptions = useMemo((): NamedEntityOption[] => {
    const mapped = (breederOptionsQuery.data ?? []).map((option) => ({
      id: option.id,
      name: option.name,
    }));

    return mergeNamedOption(mapped, formValues.breederNameText);
  }, [breederOptionsQuery.data, formValues.breederNameText]);

  const ownerOptions = useMemo(
    (): NamedEntityOption[] =>
      (ownerOptionsQuery.data ?? []).map((option) => ({
        id: option.id,
        name: option.name,
      })),
    [ownerOptionsQuery.data],
  );

  const parentOptions = useMemo<DogParentOption[]>(() => {
    const mapped = (parentOptionsQuery.data ?? [])
      .filter((option) => (option.registrationNo?.trim().length ?? 0) > 0)
      .map((option) => ({
        registrationNo: option.registrationNo ?? "",
        name: option.name,
      }));

    const withSire = mergeParentOption(mapped, {
      registrationNo: formValues.sirePreviewRegistrationNo,
      name: formValues.sirePreviewName,
    });

    return mergeParentOption(withSire, {
      registrationNo: formValues.damPreviewRegistrationNo,
      name: formValues.damPreviewName,
    });
  }, [
    parentOptionsQuery.data,
    formValues.sirePreviewRegistrationNo,
    formValues.sirePreviewName,
    formValues.damPreviewRegistrationNo,
    formValues.damPreviewName,
  ]);

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
          registrationNo: values.registrationNo.trim(),
          secondaryRegistrationNos: normalizeSecondaryRegistrations(
            values.secondaryRegistrationNos,
          ),
          sireRegistrationNo:
            normalizeOptionalText(values.sirePreviewRegistrationNo) ??
            undefined,
          damRegistrationNo:
            normalizeOptionalText(values.damPreviewRegistrationNo) ?? undefined,
          titles: normalizeTitlesForMutation(values.titles),
        });

        toast.success(t("admin.dogs.create.success"));
        setFormState({ open: false, mode: "create", target: null });
      } catch (error) {
        toast.error(getDogMutationErrorMessage(getMutationErrorCode(error)));
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
        birthDate: normalizeOptionalText(values.birthDate),
        breederNameText: normalizeOptionalText(values.breederNameText),
        ownerNames: values.ownershipNames,
        ekNo: normalizeEkNo(values.ekNo),
        note: normalizeOptionalText(values.note),
        registrationNo: values.registrationNo.trim(),
        secondaryRegistrationNos: normalizeSecondaryRegistrations(
          values.secondaryRegistrationNos,
        ),
        sireRegistrationNo: resolveParentRegistrationUpdateValue(
          values.sirePreviewRegistrationNo,
          formState.target.sirePreview?.registrationNo ?? "",
        ),
        damRegistrationNo: resolveParentRegistrationUpdateValue(
          values.damPreviewRegistrationNo,
          formState.target.damPreview?.registrationNo ?? "",
        ),
        titles: normalizeTitlesForMutation(values.titles),
      });

      toast.success(t("admin.dogs.edit.success"));
      setFormState({ open: false, mode: "create", target: null });
    } catch (error) {
      toast.error(getDogMutationErrorMessage(getMutationErrorCode(error)));
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteDogMutation.mutateAsync({ id: deleteTarget.id });
      toast.success(t("admin.dogs.delete.success"));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getDogMutationErrorMessage(getMutationErrorCode(error)));
    }
  }

  const resultCount = dogs.length;

  return (
    <div className="space-y-4" suppressHydrationWarning>
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
        isDeleting={deleteDogMutation.isPending}
      />
    </div>
  );
}
