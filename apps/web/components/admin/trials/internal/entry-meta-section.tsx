import React from "react";
import { Input } from "@/components/ui/input";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";

type Props = {
  entryDraft: EntryDraft;
  isPending: boolean;
  onChange: (updater: (current: EntryDraft) => EntryDraft) => void;
};

export function EntryMetaSection({ entryDraft, isPending, onChange }: Props) {
  function updateField(field: keyof EntryDraft, value: string) {
    onChange((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Kokeen ja koiran tiedot
        </h4>
        <div className="grid gap-3 md:grid-cols-4">
          <TextField
            label="Koemaasto"
            value={entryDraft.koemaasto}
            disabled={isPending}
            onChange={(value) => updateField("koemaasto", value)}
          />
          <TextField
            label="Koemuoto"
            value={entryDraft.koemuoto}
            disabled={isPending}
            onChange={(value) => updateField("koemuoto", value)}
          />
          <label className="space-y-1 text-sm">
            <span>Koetyyppi</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={entryDraft.koetyyppi}
              disabled={isPending}
              onChange={(event) =>
                updateField(
                  "koetyyppi",
                  event.target.value as EntryDraft["koetyyppi"],
                )
              }
            >
              <option value="NORMAL">Normaali</option>
              <option value="KOKOKAUDENKOE">Koko kauden koe</option>
              <option value="PITKAKOE">Pitkä koe</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Keli</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={entryDraft.ke}
              disabled={isPending}
              onChange={(event) => updateField("ke", event.target.value)}
            >
              <option value="">-</option>
              <option value="P">Paljas maa</option>
              <option value="L">Lumikeli</option>
            </select>
          </label>
          <TextField
            label="Luokka"
            value={entryDraft.lk}
            disabled={isPending}
            onChange={(value) => updateField("lk", value)}
          />
          <TextField
            label="Omistaja"
            value={entryDraft.omistajaSnapshot}
            disabled={isPending}
            className="md:col-span-2"
            onChange={(value) => updateField("omistajaSnapshot", value)}
          />
          <TextField
            label="Omistajan kotikunta"
            value={entryDraft.omistajanKotikuntaSnapshot}
            disabled={isPending}
            onChange={(value) =>
              updateField("omistajanKotikuntaSnapshot", value)
            }
          />
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Tulos ja huomautus
        </h4>
        <div className="grid gap-3 md:grid-cols-4">
          <TextField
            label="Palkinto"
            value={entryDraft.award}
            disabled={isPending}
            onChange={(value) => updateField("award", value)}
          />
          <TextField
            label="Sijoitus"
            value={entryDraft.rank}
            disabled={isPending}
            onChange={(value) => updateField("rank", value)}
          />
          <TextField
            label="Loppupisteet"
            value={entryDraft.points}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("points", value)}
          />
          <TextField
            label="Koiria luokassa"
            value={entryDraft.koiriaLuokassa}
            inputMode="numeric"
            disabled={isPending}
            onChange={(value) => updateField("koiriaLuokassa", value)}
          />
          <label className="space-y-1 text-sm">
            <span>Huomautus</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={entryDraft.huomautus}
              disabled={isPending}
              onChange={(event) =>
                updateField(
                  "huomautus",
                  event.target.value as EntryDraft["huomautus"],
                )
              }
            >
              <option value="">-</option>
              <option value="LUOPUI">Luopui</option>
              <option value="SULJETTU">Suljettu</option>
              <option value="KESKEYTETTY">Keskeytetty</option>
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-3">
            <span>Huomautusteksti</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={entryDraft.huomautusTeksti}
              disabled={isPending}
              onChange={(event) =>
                updateField("huomautusTeksti", event.target.value)
              }
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Ansiopisteet
        </h4>
        <div className="space-y-4">
          <ScoreSubsection title="Ajo">
            <TextField
              label="Hyväksytyt ajominuutit"
              value={entryDraft.hyvaksytytAjominuutit}
              inputMode="numeric"
              disabled={isPending}
              onChange={(value) => updateField("hyvaksytytAjominuutit", value)}
            />
            <TextField
              label="Ajoajan pisteet"
              value={entryDraft.ajoajanPisteet}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("ajoajanPisteet", value)}
            />
            <TextField
              label="Ajotaito / yleisvaikutelma"
              value={entryDraft.yva}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("yva", value)}
            />
          </ScoreSubsection>
          <ScoreSubsection title="Haku">
            <TextField
              label="Haku"
              value={entryDraft.haku}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("haku", value)}
            />
          </ScoreSubsection>
          <ScoreSubsection title="Haukku">
            <TextField
              label="Haukku"
              value={entryDraft.hauk}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("hauk", value)}
            />
          </ScoreSubsection>
          <ScoreSubsection title="Muut">
            <TextField
              label="Ansiopisteet yhteensä"
              value={entryDraft.ansiopisteetYhteensa}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("ansiopisteetYhteensa", value)}
            />
            <TextField
              label="Tie ja estetyöskentely"
              value={entryDraft.tja}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("tja", value)}
            />
            <TextField
              label="Metsästysinto"
              value={entryDraft.pin}
              inputMode="decimal"
              disabled={isPending}
              onChange={(value) => updateField("pin", value)}
            />
          </ScoreSubsection>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Tappiopisteet
        </h4>
        <div className="grid gap-3 md:grid-cols-4">
          <TextField
            label="Hakulöysyys"
            value={entryDraft.hlo}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("hlo", value)}
          />
          <TextField
            label="Ajolöysyys"
            value={entryDraft.alo}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("alo", value)}
          />
          <TextField
            label="Tappiopisteet yhteensä"
            value={entryDraft.tappiopisteetYhteensa}
            inputMode="decimal"
            disabled={isPending}
            onChange={(value) => updateField("tappiopisteetYhteensa", value)}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Tuomarit ja allekirjoitukset
        </h4>
        <div className="grid gap-3 md:grid-cols-4">
          <TextField
            label="Ylituomari"
            value={entryDraft.judge}
            disabled={isPending}
            onChange={(value) => updateField("judge", value)}
          />
          <TextField
            label="Ylituomarin numero"
            value={entryDraft.ylituomariNumeroSnapshot}
            disabled={isPending}
            onChange={(value) => updateField("ylituomariNumeroSnapshot", value)}
          />
          <TextField
            label="Ryhmätuomari"
            value={entryDraft.ryhmatuomariNimi}
            disabled={isPending}
            onChange={(value) => updateField("ryhmatuomariNimi", value)}
          />
          <TextField
            label="Palkintotuomari"
            value={entryDraft.palkintotuomariNimi}
            disabled={isPending}
            onChange={(value) => updateField("palkintotuomariNimi", value)}
          />
        </div>
      </section>
    </div>
  );
}

type ScoreSubsectionProps = {
  title: string;
  children: React.ReactNode;
};

function ScoreSubsection({ title, children }: ScoreSubsectionProps) {
  return (
    <section className="space-y-2 rounded-md border border-dashed border-muted-foreground/40 p-3">
      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h5>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  disabled,
  inputMode,
  className,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`space-y-1 text-sm ${className ?? ""}`}>
      <span>{label}</span>
      <Input
        value={value}
        inputMode={inputMode}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
