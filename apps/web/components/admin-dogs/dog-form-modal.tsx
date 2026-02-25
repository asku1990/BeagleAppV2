import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import type { AdminDogFormValues, AdminDogRecord } from "./types";

type DogFormModalProps = {
  mode: "create" | "edit";
  dog: AdminDogRecord | null;
  values: AdminDogFormValues;
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onValuesChange: (values: AdminDogFormValues) => void;
  onSubmit: (values: AdminDogFormValues) => void;
};

export function DogFormModal({
  mode,
  dog,
  values,
  open,
  isSubmitting = false,
  onClose,
  onValuesChange,
  onSubmit,
}: DogFormModalProps) {
  const { t } = useI18n();

  const isSubmitDisabled = useMemo(() => {
    return isSubmitting || values.name.trim().length === 0;
  }, [isSubmitting, values.name]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === "create"
          ? t("admin.dogs.form.createModalAria")
          : t("admin.dogs.form.editModalAria")
      }
    >
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            {mode === "create"
              ? t("admin.dogs.form.createTitle")
              : t("admin.dogs.form.editTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={values.registrationNo}
            onChange={(event) =>
              onValuesChange({ ...values, registrationNo: event.target.value })
            }
            placeholder={t("admin.dogs.form.registrationNoPlaceholder")}
          />
          <Input
            value={values.name}
            onChange={(event) =>
              onValuesChange({ ...values, name: event.target.value })
            }
            placeholder={t("admin.dogs.form.namePlaceholder")}
          />
          <Input
            type="date"
            value={values.birthDate}
            onChange={(event) =>
              onValuesChange({ ...values, birthDate: event.target.value })
            }
            aria-label={t("admin.dogs.form.birthDateAria")}
          />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("admin.dogs.form.sexLabel")}
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

          <Input
            value={values.breederNameText}
            onChange={(event) =>
              onValuesChange({ ...values, breederNameText: event.target.value })
            }
            placeholder={t("admin.dogs.form.breederNameTextPlaceholder")}
          />
          <Input
            value={values.ownershipPreviewText}
            onChange={(event) =>
              onValuesChange({
                ...values,
                ownershipPreviewText: event.target.value,
              })
            }
            placeholder={t("admin.dogs.form.ownersPlaceholder")}
          />
          <Input
            value={values.sirePreviewName}
            onChange={(event) =>
              onValuesChange({ ...values, sirePreviewName: event.target.value })
            }
            placeholder={t("admin.dogs.form.sireNamePlaceholder")}
          />
          <Input
            value={values.sirePreviewRegistrationNo}
            onChange={(event) =>
              onValuesChange({
                ...values,
                sirePreviewRegistrationNo: event.target.value,
              })
            }
            placeholder={t("admin.dogs.form.sireRegistrationNoPlaceholder")}
          />
          <Input
            value={values.damPreviewName}
            onChange={(event) =>
              onValuesChange({ ...values, damPreviewName: event.target.value })
            }
            placeholder={t("admin.dogs.form.damNamePlaceholder")}
          />
          <Input
            value={values.damPreviewRegistrationNo}
            onChange={(event) =>
              onValuesChange({
                ...values,
                damPreviewRegistrationNo: event.target.value,
              })
            }
            placeholder={t("admin.dogs.form.damRegistrationNoPlaceholder")}
          />
          <Input
            value={values.ekNo}
            onChange={(event) =>
              onValuesChange({ ...values, ekNo: event.target.value })
            }
            inputMode="numeric"
            placeholder={t("admin.dogs.form.ekNoPlaceholder")}
          />
          <Input
            value={values.note}
            onChange={(event) =>
              onValuesChange({ ...values, note: event.target.value })
            }
            placeholder={t("admin.dogs.form.notePlaceholder")}
          />

          {mode === "edit" && dog ? (
            <p className="text-xs text-muted-foreground">
              {t("admin.dogs.form.recordIdPrefix")} {dog.id}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => onSubmit(values)}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
