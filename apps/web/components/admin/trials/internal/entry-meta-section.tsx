import React from "react";
import { Input } from "@/components/ui/input";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";

type Props = {
  entryDraft: EntryDraft;
  isPending: boolean;
  onChange: (updater: (current: EntryDraft) => EntryDraft) => void;
};

export function EntryMetaSection({ entryDraft, isPending, onChange }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="space-y-1 text-sm">
        <span>Koemuoto</span>
        <Input
          value={entryDraft.koemuoto}
          disabled={isPending}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              koemuoto: event.target.value,
            }))
          }
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>Koetyyppi</span>
        <select
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
          value={entryDraft.koetyyppi}
          disabled={isPending}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              koetyyppi: event.target.value as EntryDraft["koetyyppi"],
            }))
          }
        >
          <option value="NORMAL">NORMAL</option>
          <option value="KOKOKAUDENKOE">KOKOKAUDENKOE</option>
          <option value="PITKAKOE">PITKAKOE</option>
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span>Koiria luokassa</span>
        <Input
          value={entryDraft.koiriaLuokassa}
          inputMode="numeric"
          disabled={isPending}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              koiriaLuokassa: event.target.value,
            }))
          }
        />
      </label>
    </div>
  );
}
