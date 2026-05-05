"use client";

import React from "react";
import { AdminFormModalShell } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { useI18n } from "@/hooks/i18n";
import {
  createEmptyEraDraft,
  isValidOptionalDecimal,
  isValidOptionalInteger,
  parseDecimal,
  parseInteger,
  parseNullableString,
  toEntryDraft,
  toEraDrafts,
  toLisatietoRows,
  type EntryDraft,
  type EraDraft,
  type LisatietoRowDraft,
} from "@/lib/admin/trials/entry-edit-dialog-model";
import type {
  AdminTrialEventEntry,
  UpdateAdminTrialEntryRequest,
} from "@beagle/contracts";
import { EntryMetaSection } from "./internal/entry-meta-section";
import { EraSection } from "./internal/era-section";
import { LisatiedotMatrix } from "./internal/lisatiedot-matrix";

type Props = {
  open: boolean;
  trialEventId: string;
  eventDate?: string;
  eventPlace?: string;
  entry: AdminTrialEventEntry;
  isPending: boolean;
  errorText: string | null;
  onClose: () => void;
  onSave: (payload: UpdateAdminTrialEntryRequest) => Promise<boolean>;
};

const ENTRY_INTEGER_FIELDS: Array<{
  field: keyof EntryDraft;
  label: string;
}> = [
  { field: "koiriaLuokassa", label: "Koiria luokassa" },
  { field: "hyvaksytytAjominuutit", label: "Hyväksytyt ajominuutit" },
];

const ENTRY_DECIMAL_FIELDS: Array<{
  field: keyof EntryDraft;
  label: string;
}> = [
  { field: "points", label: "Loppupisteet" },
  { field: "ajoajanPisteet", label: "Ajoajan pisteet" },
  { field: "haku", label: "Haku" },
  { field: "hauk", label: "Haukku" },
  { field: "yva", label: "Ajotaito / yleisvaikutelma" },
  { field: "hlo", label: "Hakulöysyys" },
  { field: "alo", label: "Ajolöysyys" },
  { field: "tja", label: "Tie ja estetyöskentely" },
  { field: "pin", label: "Metsästysinto" },
  { field: "ansiopisteetYhteensa", label: "Ansiopisteet yhteensä" },
  { field: "tappiopisteetYhteensa", label: "Tappiopisteet yhteensä" },
];

const ERA_INTEGER_FIELDS: Array<{
  field: Exclude<keyof EraDraft, "era">;
  label: string;
}> = [
  { field: "hakumin", label: "hakumin" },
  { field: "ajomin", label: "ajomin" },
];

const ERA_DECIMAL_FIELDS: Array<{
  field: Exclude<keyof EraDraft, "era">;
  label: string;
}> = [
  { field: "haku", label: "haku" },
  { field: "hauk", label: "haukku" },
  { field: "yva", label: "ajotaito / yleisvaikutelma" },
  { field: "hlo", label: "hakulöysyys" },
  { field: "alo", label: "ajolöysyys" },
  { field: "tja", label: "tie ja estetyöskentely" },
  { field: "pin", label: "metsästysinto" },
];

function findInvalidNumericField(
  entryDraft: EntryDraft,
  eras: EraDraft[],
): string | null {
  for (const { field, label } of ENTRY_INTEGER_FIELDS) {
    if (!isValidOptionalInteger(entryDraft[field])) {
      return label;
    }
  }
  for (const { field, label } of ENTRY_DECIMAL_FIELDS) {
    if (!isValidOptionalDecimal(entryDraft[field])) {
      return label;
    }
  }
  for (const era of eras) {
    for (const { field, label } of ERA_INTEGER_FIELDS) {
      if (!isValidOptionalInteger(era[field])) {
        return `Erä ${era.era}: ${label}`;
      }
    }
    for (const { field, label } of ERA_DECIMAL_FIELDS) {
      if (!isValidOptionalDecimal(era[field])) {
        return `Erä ${era.era}: ${label}`;
      }
    }
  }
  return null;
}

export function AdminTrialEntryEditDialog({
  open,
  trialEventId,
  eventDate,
  eventPlace,
  entry,
  isPending,
  errorText,
  onClose,
  onSave,
}: Props) {
  const { t } = useI18n();
  const [entryDraft, setEntryDraft] = React.useState<EntryDraft>(() =>
    toEntryDraft(entry),
  );
  const [eras, setEras] = React.useState<EraDraft[]>(() => toEraDrafts(entry));
  const [lisatiedotRows, setLisatiedotRows] = React.useState<
    LisatietoRowDraft[]
  >(() => toLisatietoRows(entry, toEraDrafts(entry)));
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );
  const eventDateLabel = formatDateForFinland(eventDate);
  const eventPlaceLabel = eventPlace?.trim() ? eventPlace : "-";
  const previousEntryIdRef = React.useRef(entry.trialId);

  const reset = React.useCallback(() => {
    const initialEras = toEraDrafts(entry);
    setEntryDraft(toEntryDraft(entry));
    setEras(initialEras);
    setLisatiedotRows(toLisatietoRows(entry, initialEras));
    setValidationError(null);
  }, [entry]);

  React.useEffect(() => {
    if (!open) {
      previousEntryIdRef.current = entry.trialId;
      return;
    }
    if (previousEntryIdRef.current !== entry.trialId) {
      reset();
      previousEntryIdRef.current = entry.trialId;
    }
  }, [entry.trialId, open, reset]);

  function addEra() {
    const nextEra = Math.max(...eras.map((era) => era.era), 1) + 1;
    setEras((current) => [...current, createEmptyEraDraft(nextEra)]);
    setLisatiedotRows((current) =>
      current.map((row) => ({
        ...row,
        eraValues: { ...row.eraValues, [nextEra]: "" },
      })),
    );
  }

  function removeEra(eraToRemove: number) {
    if (eraToRemove <= 2) {
      return;
    }
    setEras((current) => current.filter((era) => era.era !== eraToRemove));
    setLisatiedotRows((current) =>
      current.map((row) => {
        const nextValues = { ...row.eraValues };
        delete nextValues[eraToRemove];
        return { ...row, eraValues: nextValues };
      }),
    );
  }

  return (
    <AdminFormModalShell
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t("admin.trials.manage.selected.actions.editEntry")}
      ariaLabel={t("admin.trials.manage.selected.actions.editEntry")}
      contentClassName="max-h-[90vh] max-w-6xl overflow-y-auto"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t("admin.trials.manage.eventModal.close")}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              void (async () => {
                setValidationError(null);
                const sortedEras = [...eras].sort(
                  (left, right) => left.era - right.era,
                );
                const invalidNumericField = findInvalidNumericField(
                  entryDraft,
                  sortedEras,
                );
                if (invalidNumericField) {
                  setValidationError(
                    `Tarkista numeerinen kenttä: ${invalidNumericField}.`,
                  );
                  return;
                }

                const ok = await onSave({
                  trialEventId,
                  trialEntryId: entry.trialId,
                  entry: {
                    koemaasto: parseNullableString(entryDraft.koemaasto),
                    koemuoto: parseNullableString(entryDraft.koemuoto),
                    koetyyppi: entryDraft.koetyyppi,
                    ke: parseNullableString(entryDraft.ke),
                    lk: parseNullableString(entryDraft.lk),
                    award: parseNullableString(entryDraft.award),
                    rank: parseNullableString(entryDraft.rank),
                    points: parseDecimal(entryDraft.points),
                    koiriaLuokassa: parseInteger(entryDraft.koiriaLuokassa),
                    hyvaksytytAjominuutit: parseInteger(
                      entryDraft.hyvaksytytAjominuutit,
                    ),
                    ajoajanPisteet: parseDecimal(entryDraft.ajoajanPisteet),
                    haku: parseDecimal(entryDraft.haku),
                    hauk: parseDecimal(entryDraft.hauk),
                    yva: parseDecimal(entryDraft.yva),
                    hlo: parseDecimal(entryDraft.hlo),
                    alo: parseDecimal(entryDraft.alo),
                    tja: parseDecimal(entryDraft.tja),
                    pin: parseDecimal(entryDraft.pin),
                    ansiopisteetYhteensa: parseDecimal(
                      entryDraft.ansiopisteetYhteensa,
                    ),
                    tappiopisteetYhteensa: parseDecimal(
                      entryDraft.tappiopisteetYhteensa,
                    ),
                    judge: parseNullableString(entryDraft.judge),
                    huomautus: entryDraft.huomautus || null,
                    huomautusTeksti: parseNullableString(
                      entryDraft.huomautusTeksti,
                    ),
                    ylituomariNumeroSnapshot: parseNullableString(
                      entryDraft.ylituomariNumeroSnapshot,
                    ),
                    ryhmatuomariNimi: parseNullableString(
                      entryDraft.ryhmatuomariNimi,
                    ),
                    palkintotuomariNimi: parseNullableString(
                      entryDraft.palkintotuomariNimi,
                    ),
                    omistajaSnapshot: parseNullableString(
                      entryDraft.omistajaSnapshot,
                    ),
                    omistajanKotikuntaSnapshot: parseNullableString(
                      entryDraft.omistajanKotikuntaSnapshot,
                    ),
                  },
                  eras: sortedEras.map((era) => ({
                    era: era.era,
                    alkoi: parseNullableString(era.alkoi),
                    hakumin: parseInteger(era.hakumin),
                    ajomin: parseInteger(era.ajomin),
                    haku: parseDecimal(era.haku),
                    hauk: parseDecimal(era.hauk),
                    yva: parseDecimal(era.yva),
                    hlo: parseDecimal(era.hlo),
                    alo: parseDecimal(era.alo),
                    tja: parseDecimal(era.tja),
                    pin: parseDecimal(era.pin),
                    huomautusTeksti: parseNullableString(era.huomautusTeksti),
                  })),
                  lisatiedotRows: lisatiedotRows.map((row) => ({
                    koodi: row.koodi,
                    osa: row.osa,
                    nimi: row.nimi,
                    jarjestys: row.jarjestys,
                    eraValues: sortedEras.map((era) => ({
                      era: era.era,
                      arvo: parseNullableString(row.eraValues[era.era] ?? ""),
                    })),
                  })),
                });
                if (ok) {
                  reset();
                  onClose();
                }
              })()
            }
          >
            {isPending
              ? t("admin.trials.manage.eventModal.saving")
              : t("admin.trials.manage.eventModal.save")}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {validationError ? (
          <p className="text-sm text-destructive">{validationError}</p>
        ) : null}
        {errorText ? (
          <p className="text-sm text-destructive">{errorText}</p>
        ) : null}
        <section className="rounded-md border bg-muted/20 p-3 text-sm">
          <p className="font-semibold">
            {t("admin.trials.manage.entryModal.header.title")}
          </p>
          <div className="mt-1 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
            <p>
              {t("admin.trials.manage.entryModal.header.dog")}: {entry.dogName}
            </p>
            <p>
              {t("admin.trials.manage.entryModal.header.registration")}:{" "}
              {entry.registrationNo ?? "-"}
            </p>
            <p>
              {t("admin.trials.manage.entryModal.header.entryId")}:{" "}
              {entry.trialId}
            </p>
            {eventDate || eventPlace ? (
              <p>
                {t("admin.trials.manage.entryModal.header.event")}:{" "}
                {eventDateLabel} • {eventPlaceLabel}
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Perustiedot</h3>
          <EntryMetaSection
            entryDraft={entryDraft}
            isPending={isPending}
            onChange={setEntryDraft}
          />
        </section>

        <EraSection
          eras={eras}
          isPending={isPending}
          onAddEra={addEra}
          onRemoveEra={removeEra}
          onChangeEraField={(eraNumber, field, value) =>
            setEras((current) =>
              current.map((currentEra) =>
                currentEra.era === eraNumber
                  ? { ...currentEra, [field]: value }
                  : currentEra,
              ),
            )
          }
        />

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Lisätiedot</h3>
          <LisatiedotMatrix
            eras={eras}
            rows={lisatiedotRows}
            isPending={isPending}
            onChangeCell={(koodi, osa, era, value) =>
              setLisatiedotRows((current) =>
                current.map((currentRow) =>
                  currentRow.koodi === koodi && currentRow.osa === osa
                    ? {
                        ...currentRow,
                        eraValues: {
                          ...currentRow.eraValues,
                          [era]: value,
                        },
                      }
                    : currentRow,
                ),
              )
            }
          />
        </section>
      </div>
    </AdminFormModalShell>
  );
}
