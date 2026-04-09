import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";
import type { NamedEntityOption } from "./dog-form-types";
import {
  addOwnerFromCandidate,
  removeOwnerByName,
} from "@/lib/admin/dogs/manage/dog-form-section-updates";

type DogFormBreederOwnersSectionProps = {
  values: AdminDogFormValues;
  breederOptions: NamedEntityOption[];
  ownerOptions: NamedEntityOption[];
  breederSelectedId: string;
  breederComboboxOptions: ComboboxOption[];
  ownerComboboxOptions: ComboboxOption[];
  onValuesChange: (values: AdminDogFormValues) => void;
  onBreederSearchChange: (value: string) => void;
  onOwnerSearchChange: (value: string) => void;
  t: (key: MessageKey) => string;
};

export function DogFormBreederOwnersSection({
  values,
  breederOptions,
  ownerOptions,
  breederSelectedId,
  breederComboboxOptions,
  ownerComboboxOptions,
  onValuesChange,
  onBreederSearchChange,
  onOwnerSearchChange,
  t,
}: DogFormBreederOwnersSectionProps) {
  const [ownerCandidate, setOwnerCandidate] = useState("");
  const selectedOwners = values.ownershipNames;

  return (
    <>
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
              const result = addOwnerFromCandidate(
                values,
                ownerCandidate,
                ownerOptions,
              );
              onValuesChange(result.values);
              setOwnerCandidate(result.ownerCandidate);
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
                    onValuesChange(removeOwnerByName(values, ownerName))
                  }
                >
                  {ownerName}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
