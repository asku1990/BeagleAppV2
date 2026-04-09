import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";
import {
  appendSecondaryRegistration,
  removeSecondaryRegistrationAt,
  setSecondaryRegistrationAt,
} from "@/lib/admin/dogs/manage/dog-form-section-updates";

type DogFormRegistrationSectionProps = {
  values: AdminDogFormValues;
  onValuesChange: (values: AdminDogFormValues) => void;
  t: (key: MessageKey) => string;
};

export function DogFormRegistrationSection({
  values,
  onValuesChange,
  t,
}: DogFormRegistrationSectionProps) {
  return (
    <>
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
            onClick={() => onValuesChange(appendSecondaryRegistration(values))}
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
                    onValuesChange(
                      setSecondaryRegistrationAt(
                        values,
                        index,
                        event.target.value,
                      ),
                    )
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
                    onValuesChange(removeSecondaryRegistrationAt(values, index))
                  }
                >
                  {t("admin.dogs.form.secondaryRegistrationRemove")}
                </Button>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}
