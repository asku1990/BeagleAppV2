import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_TRIAL_ERA_FIELD_LABELS } from "@/lib/admin/trials/entry-edit-config";
import type { EraDraft } from "@/lib/admin/trials/entry-edit-dialog-model";

type Props = {
  eras: EraDraft[];
  isPending: boolean;
  onAddEra: () => void;
  onRemoveEra: (era: number) => void;
  onChangeEraField: (
    eraNumber: number,
    field: Exclude<keyof EraDraft, "era">,
    value: string,
  ) => void;
  visibleFields?: ReadonlySet<Exclude<keyof EraDraft, "era">>;
  yvaLabel?: string;
};

export function EraSection({
  eras,
  isPending,
  onAddEra,
  onRemoveEra,
  onChangeEraField,
  visibleFields,
  yvaLabel,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Erät</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAddEra}>
          Lisää erä
        </Button>
      </div>
      <div className="space-y-3">
        {eras
          .slice()
          .sort((left, right) => left.era - right.era)
          .map((era) => (
            <div key={era.era} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Erä {era.era}</p>
                {era.era !== 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveEra(era.era)}
                  >
                    Poista erä
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-2 md:grid-cols-4">
                {(
                  [
                    "alkoi",
                    "hakumin",
                    "ajomin",
                    "haku",
                    "hauk",
                    "yva",
                    "hlo",
                    "alo",
                    "tja",
                    "pin",
                  ] as const
                ).map((field) =>
                  visibleFields && !visibleFields.has(field) ? null : (
                    <label key={field} className="space-y-1 text-xs">
                      <span>
                        {field === "yva"
                          ? (yvaLabel ?? ADMIN_TRIAL_ERA_FIELD_LABELS[field])
                          : ADMIN_TRIAL_ERA_FIELD_LABELS[field]}
                      </span>
                      <Input
                        value={era[field]}
                        disabled={isPending}
                        onChange={(event) =>
                          onChangeEraField(era.era, field, event.target.value)
                        }
                      />
                    </label>
                  ),
                )}
                {!visibleFields || visibleFields.has("huomautusTeksti") ? (
                  <label className="space-y-1 text-xs md:col-span-4">
                    <span>Huomautusteksti</span>
                    <Input
                      value={era.huomautusTeksti}
                      disabled={isPending}
                      onChange={(event) =>
                        onChangeEraField(
                          era.era,
                          "huomautusTeksti",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                ) : null}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
