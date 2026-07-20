import { useMemo } from "react";
import type { DogStatus } from "@beagle/contracts";
import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { type ComboboxOption } from "@/components/ui/combobox";
import { useI18n } from "@/hooks/i18n";
import { toBusinessDateInputValue } from "@/lib/admin/core/date";
import {
  DogFormBreederOwnersSection,
  DogFormIdentitySection,
  DogFormMetadataSection,
  DogFormParentsSection,
  DogFormRegistrationSection,
  DogFormStatusSection,
  DogFormTitlesSection,
} from "./internal";
import type { AdminDogFormValues, AdminDogRecord } from "./types";
import type { DogParentOption, NamedEntityOption } from "./internal";

type DogFormModalProps = {
  mode: "create" | "edit";
  dog: AdminDogRecord | null;
  values: AdminDogFormValues;
  formStatus: DogStatus;
  colorOptions: ComboboxOption[];
  ownerOptions: NamedEntityOption[];
  parentOptions: DogParentOption[];
  onOwnerSearchChange: (value: string) => void;
  onParentSearchChange: (value: string) => void;
  open: boolean;
  isSubmitting?: boolean;
  isCalculatingInbreeding?: boolean;
  onClose: () => void;
  onValuesChange: (values: AdminDogFormValues) => void;
  onFormStatusChange: (status: DogStatus) => void;
  onSubmit: (values: AdminDogFormValues) => void | Promise<void>;
  onCalculateInbreeding?: () => void | Promise<void>;
};

export function DogFormModal({
  mode,
  dog,
  values,
  formStatus,
  colorOptions,
  ownerOptions,
  parentOptions,
  onOwnerSearchChange,
  onParentSearchChange,
  open,
  isSubmitting = false,
  isCalculatingInbreeding = false,
  onClose,
  onValuesChange,
  onFormStatusChange,
  onSubmit,
  onCalculateInbreeding,
}: DogFormModalProps) {
  const { t } = useI18n();
  const todayDateInputValue = toBusinessDateInputValue(new Date());
  const normalRulesApply = formStatus === "NORMAL";
  const hasEkAssignmentWithoutNumber =
    values.ekNo.trim().length === 0 && values.ekNoAssignedOn.trim().length > 0;

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      hasEkAssignmentWithoutNumber ||
      values.registrationNo.trim().length === 0 ||
      (normalRulesApply &&
        (values.name.trim().length === 0 ||
          values.sirePreviewRegistrationNo.trim().length === 0 ||
          values.damPreviewRegistrationNo.trim().length === 0))
    );
  }, [
    isSubmitting,
    hasEkAssignmentWithoutNumber,
    normalRulesApply,
    values.name,
    values.registrationNo,
    values.sirePreviewRegistrationNo,
    values.damPreviewRegistrationNo,
  ]);

  const ownerComboboxOptions = useMemo<ComboboxOption[]>(
    () =>
      ownerOptions
        .filter((option) => !values.ownershipNames.includes(option.name))
        .map((option) => ({
          value: option.id,
          label: option.name,
        })),
    [ownerOptions, values.ownershipNames],
  );

  const parentComboboxOptions = useMemo<ComboboxOption[]>(
    () =>
      parentOptions.map((option) => ({
        value: option.registrationNo,
        label: `${option.name} (${option.registrationNo})`,
        keywords: [option.name, option.registrationNo],
      })),
    [parentOptions],
  );

  return (
    <AdminFormModalShell
      open={open}
      onClose={onClose}
      contentClassName="max-h-[90vh] max-w-xl overflow-y-auto"
      ariaLabel={
        mode === "create"
          ? t("admin.dogs.form.createModalAria")
          : t("admin.dogs.form.editModalAria")
      }
      title={
        mode === "create"
          ? t("admin.dogs.form.createTitle")
          : t("admin.dogs.form.editTitle")
      }
      footer={
        <>
          <Button
            type="button"
            onClick={() => void onSubmit(values)}
            disabled={isSubmitDisabled}
          >
            {isSubmitting
              ? t("admin.dogs.form.submitting")
              : mode === "create"
                ? t("admin.dogs.form.createSubmit")
                : t("admin.dogs.form.editSubmit")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("admin.dogs.form.cancel")}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <DogFormStatusSection
          status={formStatus}
          onStatusChange={onFormStatusChange}
          t={t}
        />

        <DogFormRegistrationSection
          values={values}
          onValuesChange={onValuesChange}
          t={t}
        />

        <DogFormIdentitySection
          values={values}
          todayDateInputValue={todayDateInputValue}
          isSubmitting={isSubmitting}
          nameRequired={normalRulesApply}
          onValuesChange={onValuesChange}
          t={t}
        />

        <DogFormBreederOwnersSection
          values={values}
          ownerOptions={ownerOptions}
          ownerComboboxOptions={ownerComboboxOptions}
          onValuesChange={onValuesChange}
          onOwnerSearchChange={onOwnerSearchChange}
          t={t}
        />

        <DogFormParentsSection
          values={values}
          parentOptions={parentOptions}
          parentComboboxOptions={parentComboboxOptions}
          onParentSearchChange={onParentSearchChange}
          onValuesChange={onValuesChange}
          onCalculateInbreeding={onCalculateInbreeding}
          isCalculatingInbreeding={isCalculatingInbreeding}
          parentsRequired={normalRulesApply}
          t={t}
        />

        <DogFormMetadataSection
          values={values}
          todayDateInputValue={todayDateInputValue}
          isSubmitting={isSubmitting}
          colorOptions={colorOptions}
          onValuesChange={onValuesChange}
          t={t}
        />

        <DogFormTitlesSection
          values={values}
          todayDateInputValue={todayDateInputValue}
          onValuesChange={onValuesChange}
          t={t}
        />

        {mode === "edit" && dog ? (
          <p className="text-xs text-muted-foreground">
            {t("admin.dogs.form.recordIdPrefix")} {dog.id}
          </p>
        ) : null}
      </div>
    </AdminFormModalShell>
  );
}
