import { describe, expect, it } from "vitest";
import {
  resolveResultCreateFieldSet,
  SEEDED_TRIAL_RULE_WINDOW_IDS,
} from "../result-create-field-registry";

describe("result create field registry", () => {
  it("registers the verified 2023+ field set from the persisted rule window", () => {
    const fieldSet = resolveResultCreateFieldSet("trw_post_20230801");

    expect(fieldSet.id).toBe("post-2023");
    expect(fieldSet.verified).toBe(true);
    expect(fieldSet.entryFields.has("tja")).toBe(false);
    expect(fieldSet.entryFields.has("pin")).toBe(false);
    expect(fieldSet.eraFields.has("tja")).toBe(false);
    expect(fieldSet.eraFields.has("pin")).toBe(false);
  });

  it("matches the verified 2023+ lisatieto codes, parts, order and kinds", () => {
    const rows = resolveResultCreateFieldSet("trw_post_20230801").lisatiedot;
    const keys = rows.map((row) => `${row.koodi}:${row.osa}`);

    expect(keys).toEqual([
      ...Array.from({ length: 15 }, (_, index) => `${index + 10}:`).slice(
        0,
        15,
      ),
      "25:a",
      "26:",
      "27:a",
      ...Array.from({ length: 8 }, (_, index) => `${index + 30}:`),
      ...Array.from({ length: 3 }, (_, index) => `${index + 40}:`),
      ...Array.from({ length: 13 }, (_, index) => `${index + 50}:`),
    ]);
    expect(
      Object.fromEntries(
        rows
          .filter((row) => ["19", "23", "26", "59"].includes(row.koodi))
          .map((row) => [row.koodi, row.inputKind]),
      ),
    ).toEqual({
      "19": "integer",
      "23": "decimal",
      "26": "decimal",
      "59": "decimal",
    });
    expect(rows.map((row) => row.persistenceOrder)).toEqual(
      [...rows]
        .map((row) => row.persistenceOrder)
        .sort((left, right) => left - right),
    );
  });

  it("maps semantic marker state to persistence without exposing raw values", () => {
    const marker = resolveResultCreateFieldSet(
      "trw_post_20230801",
    ).lisatiedot.find((row) => row.koodi === "10");

    expect(marker?.inputKind).toBe("marker");
    expect(marker?.toPersistedValue("1")).toBe("1");
    expect(marker?.toPersistedValue("0")).toBe("");
    expect(marker?.toPersistedValue("")).toBe("");
  });

  it.each([
    ...SEEDED_TRIAL_RULE_WINDOW_IDS.filter((id) => id !== "trw_post_20230801"),
    null,
    "unknown-window",
  ])("uses the warned show-all fallback for %s", (trialRuleWindowId) => {
    const fieldSet = resolveResultCreateFieldSet(trialRuleWindowId);

    expect(fieldSet.id).toBe("unverified-fallback");
    expect(fieldSet.verified).toBe(false);
    expect(fieldSet.entryFields.has("tja")).toBe(true);
    expect(fieldSet.eraFields.has("pin")).toBe(true);
    expect(
      fieldSet.lisatiedot.some((row) => row.koodi === "25" && row.osa === "b"),
    ).toBe(true);
  });
});
