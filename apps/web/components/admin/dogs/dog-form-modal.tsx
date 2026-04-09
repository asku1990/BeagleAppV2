import { useMemo, useState } from "react";
import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import type { AdminDogFormValues, AdminDogRecord } from "./types";

type DogParentOption = {
  registrationNo: string;
  name: string;
};

type NamedEntityOption = {
  id: string;
  name: string;
};

type DogFormModalProps = {
  mode: "create" | "edit";
  dog: AdminDogRecord | null;
  values: AdminDogFormValues;
  breederOptions: NamedEntityOption[];
  ownerOptions: NamedEntityOption[];
  parentOptions: DogParentOption[];
  onBreederSearchChange: (value: string) => void;
  onOwnerSearchChange: (value: string) => void;
  onParentSearchChange: (value: string) => void;
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onValuesChange: (values: AdminDogFormValues) => void;
  onSubmit: (values: AdminDogFormValues) => void | Promise<void>;
};

export function DogFormModal({
  mode,
  dog,
  values,
  breederOptions,
  ownerOptions,
  parentOptions,
  onBreederSearchChange,
  onOwnerSearchChange,
  onParentSearchChange,
  open,
  isSubmitting = false,
  onClose,
  onValuesChange,
  onSubmit,
}: DogFormModalProps) {
  const { t } = useI18n();
  const [ownerCandidate, setOwnerCandidate] = useState("");
  const todayDateInputValue = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );
  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      values.name.trim().length === 0 ||
      values.registrationNo.trim().length === 0
    );
  }, [isSubmitting, values.name, values.registrationNo]);

  const selectedOwners = values.ownershipNames;
  const breederSelectedId = useMemo(
    () =>
      breederOptions.find((option) => option.name === values.breederNameText)
        ?.id ?? "",
    [breederOptions, values.breederNameText],
  );
  const breederComboboxOptions = useMemo<ComboboxOption[]>(
    () =>
      breederOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    [breederOptions],
  );
  const ownerComboboxOptions = useMemo<ComboboxOption[]>(
    () =>
      ownerOptions
        .filter((option) => !selectedOwners.includes(option.name))
        .map((option) => ({
          value: option.id,
          label: option.name,
        })),
    [ownerOptions, selectedOwners],
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
        <p className="text-sm text-muted-foreground">
          {t("admin.dogs.form.registrationNoPlaceholder")} *
        </p>
        <Input
          value={values.registrationNo}
          onChange={(event) =>
            onValuesChange({
              ...values,
              registrationNo: event.target.value.toUpperCase(),
            })
          }
          placeholder={t("admin.dogs.form.registrationNoPlaceholder")}
          maxLength={40}
          required
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("admin.dogs.form.secondaryRegistrationLabel")}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onValuesChange({
                  ...values,
                  secondaryRegistrationNos: [
                    ...values.secondaryRegistrationNos,
                    "",
                  ],
                })
              }
            >
              {t("admin.dogs.form.secondaryRegistrationAdd")}
            </Button>
          </div>
          {values.secondaryRegistrationNos.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t("admin.dogs.form.secondaryRegistrationEmpty")}
            </p>
          ) : null}
          <div className="space-y-2">
            {values.secondaryRegistrationNos.map(
              (secondaryRegistrationNo, index) => (
                <div
                  key={`secondary-registration-${index + 1}`}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={secondaryRegistrationNo}
                    onChange={(event) =>
                      onValuesChange({
                        ...values,
                        secondaryRegistrationNos:
                          values.secondaryRegistrationNos.map(
                            (value, valueIndex) =>
                              valueIndex === index
                                ? event.target.value.toUpperCase()
                                : value,
                          ),
                      })
                    }
                    placeholder={t(
                      "admin.dogs.form.secondaryRegistrationPlaceholder",
                    )}
                    maxLength={40}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onValuesChange({
                        ...values,
                        secondaryRegistrationNos:
                          values.secondaryRegistrationNos.filter(
                            (_value, valueIndex) => valueIndex !== index,
                          ),
                      })
                    }
                  >
                    {t("admin.dogs.form.secondaryRegistrationRemove")}
                  </Button>
                </div>
              ),
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("admin.dogs.form.namePlaceholder")} *
        </p>
        <Input
          value={values.name}
          onChange={(event) =>
            onValuesChange({ ...values, name: event.target.value })
          }
          placeholder={t("admin.dogs.form.namePlaceholder")}
          maxLength={120}
          required
        />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.birthDateAria")}
          </p>
          {values.birthDate.trim().length > 0 ? (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={values.birthDate}
                onChange={(event) =>
                  onValuesChange({ ...values, birthDate: event.target.value })
                }
                aria-label={t("admin.dogs.form.birthDateAria")}
                max={todayDateInputValue}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onValuesChange({
                    ...values,
                    birthDate: "",
                  })
                }
                disabled={isSubmitting}
              >
                {t("admin.dogs.form.birthDateClear")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {t("admin.dogs.form.birthDateUnknown")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onValuesChange({
                    ...values,
                    birthDate: todayDateInputValue,
                  })
                }
                disabled={isSubmitting}
              >
                {t("admin.dogs.form.birthDateSet")}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.sexLabel")} *
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={t("admin.dogs.form.sexAria")}
          >
            <Button
              type="button"
              size="sm"
              variant={values.sex === "MALE" ? "default" : "outline"}
              onClick={() => onValuesChange({ ...values, sex: "MALE" })}
            >
              {t("admin.dogs.sex.male")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={values.sex === "FEMALE" ? "default" : "outline"}
              onClick={() => onValuesChange({ ...values, sex: "FEMALE" })}
            >
              {t("admin.dogs.sex.female")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={values.sex === "UNKNOWN" ? "default" : "outline"}
              onClick={() => onValuesChange({ ...values, sex: "UNKNOWN" })}
            >
              {t("admin.dogs.sex.unknown")}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.breederSelectLabel")}
          </p>
          <Combobox
            value={breederSelectedId}
            options={breederComboboxOptions}
            onChange={(value) => {
              const selected = breederOptions.find(
                (option) => option.id === value,
              );
              onValuesChange({
                ...values,
                breederNameText: selected?.name ?? "",
              });
            }}
            onSearchChange={onBreederSearchChange}
            placeholder={t("admin.dogs.form.breederNameTextPlaceholder")}
            searchPlaceholder={t("admin.dogs.form.searchPlaceholder")}
            clearLabel={t("admin.dogs.form.selectNone")}
            emptyLabel={t("admin.dogs.form.noOptions")}
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.ownersSelectLabel")}
          </p>
          <div className="flex gap-2">
            <Combobox
              value={ownerCandidate}
              options={ownerComboboxOptions}
              onChange={setOwnerCandidate}
              onSearchChange={onOwnerSearchChange}
              placeholder={t("admin.dogs.form.ownersSelectLabel")}
              searchPlaceholder={t("admin.dogs.form.searchPlaceholder")}
              clearLabel={t("admin.dogs.form.selectNone")}
              emptyLabel={t("admin.dogs.form.noOptions")}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (ownerCandidate.length === 0) {
                  return;
                }

                const selectedOwner = ownerOptions.find(
                  (option) => option.id === ownerCandidate,
                );
                if (!selectedOwner) {
                  return;
                }

                if (selectedOwners.includes(selectedOwner.name)) {
                  return;
                }

                onValuesChange({
                  ...values,
                  ownershipNames: [...selectedOwners, selectedOwner.name],
                });
                setOwnerCandidate("");
              }}
              disabled={ownerCandidate.length === 0}
            >
              {t("admin.dogs.form.ownersAddButton")}
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {t("admin.dogs.form.ownersSelectedLabel")}
            </p>
            {selectedOwners.length === 0 ? (
              <p className="text-sm text-muted-foreground">-</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedOwners.map((ownerName) => (
                  <Button
                    key={ownerName}
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      onValuesChange({
                        ...values,
                        ownershipNames: selectedOwners.filter(
                          (name) => name !== ownerName,
                        ),
                      })
                    }
                  >
                    {ownerName}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("admin.dogs.form.sireSelectLabel")}
            </p>
            <Combobox
              value={values.sirePreviewRegistrationNo}
              options={parentComboboxOptions}
              onSearchChange={onParentSearchChange}
              onChange={(registrationNo) => {
                const selected = parentOptions.find(
                  (option) => option.registrationNo === registrationNo,
                );

                onValuesChange({
                  ...values,
                  sirePreviewName: selected?.name ?? "",
                  sirePreviewRegistrationNo: selected?.registrationNo ?? "",
                });
              }}
              placeholder={t("admin.dogs.form.sireSelectLabel")}
              searchPlaceholder={t("admin.dogs.form.searchPlaceholder")}
              clearLabel={t("admin.dogs.form.selectNone")}
              emptyLabel={t("admin.dogs.form.noOptions")}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("admin.dogs.form.damSelectLabel")}
            </p>
            <Combobox
              value={values.damPreviewRegistrationNo}
              options={parentComboboxOptions}
              onSearchChange={onParentSearchChange}
              onChange={(registrationNo) => {
                const selected = parentOptions.find(
                  (option) => option.registrationNo === registrationNo,
                );

                onValuesChange({
                  ...values,
                  damPreviewName: selected?.name ?? "",
                  damPreviewRegistrationNo: selected?.registrationNo ?? "",
                });
              }}
              placeholder={t("admin.dogs.form.damSelectLabel")}
              searchPlaceholder={t("admin.dogs.form.searchPlaceholder")}
              clearLabel={t("admin.dogs.form.selectNone")}
              emptyLabel={t("admin.dogs.form.noOptions")}
            />
          </div>
        </div>

        <Input
          value={values.ekNo}
          onChange={(event) =>
            onValuesChange({
              ...values,
              ekNo: event.target.value.replace(/\D+/gu, ""),
            })
          }
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={t("admin.dogs.form.ekNoPlaceholder")}
          maxLength={10}
        />
        <Input
          value={values.note}
          onChange={(event) =>
            onValuesChange({ ...values, note: event.target.value })
          }
          placeholder={t("admin.dogs.form.notePlaceholder")}
          maxLength={500}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("admin.dogs.form.titlesLabel")}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onValuesChange({
                  ...values,
                  titles: [
                    ...values.titles,
                    {
                      awardedOn: "",
                      titleCode: "",
                      titleName: "",
                    },
                  ],
                })
              }
            >
              {t("admin.dogs.form.titlesAdd")}
            </Button>
          </div>
          {values.titles.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t("admin.dogs.form.titlesEmpty")}
            </p>
          ) : null}
          <div className="space-y-3">
            {values.titles.map((title, index) => (
              <div
                key={`dog-title-row-${index + 1}`}
                className="space-y-2 rounded-md border p-2"
              >
                <p className="text-xs text-muted-foreground">
                  {t("admin.dogs.form.titlesRowPrefix")} {index + 1}
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  {title.awardedOn.trim().length > 0 ? (
                    <div>
                      <Input
                        type="date"
                        value={title.awardedOn}
                        onChange={(event) =>
                          onValuesChange({
                            ...values,
                            titles: values.titles.map((value, valueIndex) =>
                              valueIndex === index
                                ? { ...value, awardedOn: event.target.value }
                                : value,
                            ),
                          })
                        }
                        aria-label={t("admin.dogs.form.titleAwardedOnLabel")}
                        max={todayDateInputValue}
                      />
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("admin.dogs.form.titleAwardedOnUnknown")}
                      </p>
                    </div>
                  )}
                  <Input
                    value={title.titleCode}
                    onChange={(event) =>
                      onValuesChange({
                        ...values,
                        titles: values.titles.map((value, valueIndex) =>
                          valueIndex === index
                            ? {
                                ...value,
                                titleCode: event.target.value.toUpperCase(),
                              }
                            : value,
                        ),
                      })
                    }
                    placeholder={t("admin.dogs.form.titleCodePlaceholder")}
                    maxLength={80}
                  />
                  <Input
                    value={title.titleName}
                    onChange={(event) =>
                      onValuesChange({
                        ...values,
                        titles: values.titles.map((value, valueIndex) =>
                          valueIndex === index
                            ? { ...value, titleName: event.target.value }
                            : value,
                        ),
                      })
                    }
                    placeholder={t("admin.dogs.form.titleNamePlaceholder")}
                    maxLength={160}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                  {title.awardedOn.trim().length > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() =>
                        onValuesChange({
                          ...values,
                          titles: values.titles.map((value, valueIndex) =>
                            valueIndex === index
                              ? { ...value, awardedOn: "" }
                              : value,
                          ),
                        })
                      }
                    >
                      {t("admin.dogs.form.titleAwardedOnClear")}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() =>
                        onValuesChange({
                          ...values,
                          titles: values.titles.map((value, valueIndex) =>
                            valueIndex === index
                              ? { ...value, awardedOn: todayDateInputValue }
                              : value,
                          ),
                        })
                      }
                    >
                      {t("admin.dogs.form.titleAwardedOnSet")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      if (index === 0) {
                        return;
                      }
                      const reordered = [...values.titles];
                      const current = reordered[index];
                      reordered[index] = reordered[index - 1];
                      reordered[index - 1] = current;
                      onValuesChange({
                        ...values,
                        titles: reordered,
                      });
                    }}
                    disabled={index === 0}
                  >
                    {t("admin.dogs.form.titlesMoveUp")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      if (index >= values.titles.length - 1) {
                        return;
                      }
                      const reordered = [...values.titles];
                      const current = reordered[index];
                      reordered[index] = reordered[index + 1];
                      reordered[index + 1] = current;
                      onValuesChange({
                        ...values,
                        titles: reordered,
                      });
                    }}
                    disabled={index >= values.titles.length - 1}
                  >
                    {t("admin.dogs.form.titlesMoveDown")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      onValuesChange({
                        ...values,
                        titles: values.titles.filter(
                          (_value, valueIndex) => valueIndex !== index,
                        ),
                      })
                    }
                  >
                    {t("admin.dogs.form.titlesRemove")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {mode === "edit" && dog ? (
          <p className="text-xs text-muted-foreground">
            {t("admin.dogs.form.recordIdPrefix")} {dog.id}
          </p>
        ) : null}
      </div>
    </AdminFormModalShell>
  );
}
