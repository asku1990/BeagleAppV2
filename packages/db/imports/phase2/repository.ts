import { prisma } from "@db/core/prisma";
import type {
  LegacyTrialMirrorCounts,
  LegacyTrialMirrorRows,
  LegacyTrialMirrorTableName,
} from "../types";

type LegacyMirrorDelegate<Row> = {
  count(): Promise<number>;
  upsert(args: {
    where: Record<string, unknown>;
    create: Row;
    update: Partial<Row> & { importedAt: Date };
  }): Promise<unknown>;
};

type LegacyMirrorPrisma = {
  legacyAkoeall: LegacyMirrorDelegate<LegacyTrialMirrorRows["akoeall"][number]>;
  legacyBealt: LegacyMirrorDelegate<LegacyTrialMirrorRows["bealt"][number]>;
  legacyBealt0: LegacyMirrorDelegate<LegacyTrialMirrorRows["bealt0"][number]>;
  legacyBealt1: LegacyMirrorDelegate<LegacyTrialMirrorRows["bealt1"][number]>;
  legacyBealt2: LegacyMirrorDelegate<LegacyTrialMirrorRows["bealt2"][number]>;
  legacyBealt3: LegacyMirrorDelegate<LegacyTrialMirrorRows["bealt3"][number]>;
  $transaction(promises: Promise<unknown>[]): Promise<unknown[]>;
};

const MIRROR_BATCH_SIZE = 250;

function getLegacyMirrorPrisma(): LegacyMirrorPrisma {
  return prisma as unknown as LegacyMirrorPrisma;
}

function omitKeys<Row extends object>(
  row: Row,
  keys: readonly string[],
): Partial<Row> {
  const next: Partial<Row> = {};
  for (const [key, value] of Object.entries(row)) {
    if (!keys.includes(key)) {
      next[key as keyof Row] = value as Row[keyof Row];
    }
  }
  return next;
}

async function upsertMirrorRows<Row extends object>(
  delegate: LegacyMirrorDelegate<Row>,
  rows: Row[],
  uniqueKeyName: string,
  uniqueKeys: readonly string[],
  options?: {
    onProgress?: (processed: number, total: number) => void;
  },
): Promise<number> {
  let processed = 0;
  for (let index = 0; index < rows.length; index += MIRROR_BATCH_SIZE) {
    const batch = rows.slice(index, index + MIRROR_BATCH_SIZE);
    const importedAt = new Date();
    await getLegacyMirrorPrisma().$transaction(
      batch.map((row) => {
        const uniqueValue: Record<string, unknown> = {};
        for (const key of uniqueKeys) {
          uniqueValue[key] = (row as Record<string, unknown>)[key];
        }
        return delegate.upsert({
          where: { [uniqueKeyName]: uniqueValue },
          create: row,
          update: {
            ...omitKeys(row, uniqueKeys),
            importedAt,
          },
        }) as Promise<unknown>;
      }),
    );
    processed += batch.length;
    options?.onProgress?.(processed, rows.length);
  }
  options?.onProgress?.(processed, rows.length);
  return rows.length;
}

export async function upsertLegacyTrialMirrorRowsDb(
  rows: LegacyTrialMirrorRows,
  options?: {
    onProgress?: (
      table: LegacyTrialMirrorTableName,
      processed: number,
      total: number,
    ) => void;
  },
): Promise<LegacyTrialMirrorCounts> {
  const db = getLegacyMirrorPrisma();
  const counts: LegacyTrialMirrorCounts = {
    akoeall: await upsertMirrorRows(
      db.legacyAkoeall,
      rows.akoeall,
      "rekno_tappa_tappv",
      ["rekno", "tappa", "tappv"],
      {
        onProgress: (processed, total) =>
          options?.onProgress?.("akoeall", processed, total),
      },
    ),
    bealt: await upsertMirrorRows(
      db.legacyBealt,
      rows.bealt,
      "rekno_tappa_tappv_era",
      ["rekno", "tappa", "tappv", "era"],
      {
        onProgress: (processed, total) =>
          options?.onProgress?.("bealt", processed, total),
      },
    ),
    bealt0: await upsertMirrorRows(
      db.legacyBealt0,
      rows.bealt0,
      "rekno_tappa_tappv_era",
      ["rekno", "tappa", "tappv", "era"],
      {
        onProgress: (processed, total) =>
          options?.onProgress?.("bealt0", processed, total),
      },
    ),
    bealt1: await upsertMirrorRows(
      db.legacyBealt1,
      rows.bealt1,
      "rekno_tappa_tappv_era",
      ["rekno", "tappa", "tappv", "era"],
      {
        onProgress: (processed, total) =>
          options?.onProgress?.("bealt1", processed, total),
      },
    ),
    bealt2: await upsertMirrorRows(
      db.legacyBealt2,
      rows.bealt2,
      "rekno_tappa_tappv_era",
      ["rekno", "tappa", "tappv", "era"],
      {
        onProgress: (processed, total) =>
          options?.onProgress?.("bealt2", processed, total),
      },
    ),
    bealt3: await upsertMirrorRows(
      db.legacyBealt3,
      rows.bealt3,
      "rekno_tappa_tappv_era",
      ["rekno", "tappa", "tappv", "era"],
      {
        onProgress: (processed, total) =>
          options?.onProgress?.("bealt3", processed, total),
      },
    ),
  };

  return counts;
}

export async function countLegacyTrialMirrorRowsDb(): Promise<LegacyTrialMirrorCounts> {
  const db = getLegacyMirrorPrisma();
  return {
    akoeall: await db.legacyAkoeall.count(),
    bealt: await db.legacyBealt.count(),
    bealt0: await db.legacyBealt0.count(),
    bealt1: await db.legacyBealt1.count(),
    bealt2: await db.legacyBealt2.count(),
    bealt3: await db.legacyBealt3.count(),
  };
}
