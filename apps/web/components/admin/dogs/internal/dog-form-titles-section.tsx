import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";
import {
  appendTitle,
  moveTitleDown,
  moveTitleUp,
  removeTitleAt,
  updateTitleAt,
} from "@/lib/admin/dogs/manage/dog-form-section-updates";

type DogFormTitlesSectionProps = {
  values: AdminDogFormValues;
  todayDateInputValue: string;
  onValuesChange: (values: AdminDogFormValues) => void;
  t: (key: MessageKey) => string;
};

export function DogFormTitlesSection({
  values,
  todayDateInputValue,
  onValuesChange,
  t,
}: DogFormTitlesSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("admin.dogs.form.titlesLabel")}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onValuesChange(appendTitle(values))}
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
                      onValuesChange(
                        updateTitleAt(values, index, {
                          awardedOn: event.target.value,
                        }),
                      )
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
                  onValuesChange(
                    updateTitleAt(values, index, {
                      titleCode: event.target.value.toUpperCase(),
                    }),
                  )
                }
                placeholder={t("admin.dogs.form.titleCodePlaceholder")}
                maxLength={80}
              />
              <Input
                value={title.titleName}
                onChange={(event) =>
                  onValuesChange(
                    updateTitleAt(values, index, {
                      titleName: event.target.value,
                    }),
                  )
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
                    onValuesChange(
                      updateTitleAt(values, index, { awardedOn: "" }),
                    )
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
                    onValuesChange(
                      updateTitleAt(values, index, {
                        awardedOn: todayDateInputValue,
                      }),
                    )
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
                onClick={() => onValuesChange(moveTitleUp(values, index))}
                disabled={index === 0}
              >
                {t("admin.dogs.form.titlesMoveUp")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => onValuesChange(moveTitleDown(values, index))}
                disabled={index >= values.titles.length - 1}
              >
                {t("admin.dogs.form.titlesMoveDown")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => onValuesChange(removeTitleAt(values, index))}
              >
                {t("admin.dogs.form.titlesRemove")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
