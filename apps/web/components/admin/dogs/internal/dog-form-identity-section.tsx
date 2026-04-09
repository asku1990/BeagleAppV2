import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";

type DogFormIdentitySectionProps = {
  values: AdminDogFormValues;
  todayDateInputValue: string;
  isSubmitting: boolean;
  onValuesChange: (values: AdminDogFormValues) => void;
  t: (key: MessageKey) => string;
};

export function DogFormIdentitySection({
  values,
  todayDateInputValue,
  isSubmitting,
  onValuesChange,
  t,
}: DogFormIdentitySectionProps) {
  return (
    <>
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
    </>
  );
}
