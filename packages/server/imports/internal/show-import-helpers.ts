import { createHash } from "node:crypto";
import type { LegacyShowResultRow } from "@beagle/db";

export type ShowSourceTagValue =
  | "LEGACY_NAY9599"
  | "LEGACY_BEANAY"
  | "LEGACY_BEANAY_TEXT"
  | "WORKBOOK_KENNELLIITTO"
  | "MANUAL_ADMIN";

export function normalizePlaceKey(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
}

export function toSourceTag(
  table: LegacyShowResultRow["sourceTable"],
): ShowSourceTagValue {
  return table === "beanay" ? "LEGACY_BEANAY" : "LEGACY_NAY9599";
}

export function sourceHash(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
