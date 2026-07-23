import { describe, expect, it } from "vitest";
import { ADMIN_TRIAL_LISATIETO_GROUP_ORDER } from "../entry-edit-config";
import {
  resolveResultCreateFieldSet,
  SEEDED_TRIAL_RULE_WINDOW_IDS,
} from "../result-create-field-registry";

describe("result create field registry", () => {
  it("uses the official PDF domain order for lisatieto groups", () => {
    expect(ADMIN_TRIAL_LISATIETO_GROUP_ORDER).toEqual([
      "olosuhteet",
      "haku",
      "haukku",
      "metsastysinto",
      "ajo",
      "muut_ominaisuudet",
      "unknown",
    ]);
  });

  it("registers the verified 2023+ field set from the persisted rule window", () => {
    const fieldSet = resolveResultCreateFieldSet("trw_post_20230801");

    expect(fieldSet.id).toBe("post-2023");
    expect(fieldSet.verified).toBe(true);
    expect(fieldSet.entryFields.has("tja")).toBe(false);
    expect(fieldSet.entryFields.has("pin")).toBe(false);
    expect(fieldSet.eraFields.has("tja")).toBe(false);
    expect(fieldSet.eraFields.has("pin")).toBe(false);
    expect(fieldSet.yvaLabels).toEqual({
      entry: "Ajotaito",
      era: "ajotaito",
    });
    expect(fieldSet.presentationGroups.map((group) => group.id)).toEqual([
      "basic",
      "time",
      "merit",
      "loss",
      "result",
      "judges",
    ]);
    expect(
      fieldSet.presentationGroups.flatMap((group) => group.entryFields),
    ).not.toContain("tja");
    expect(
      fieldSet.presentationGroups.find((group) => group.id === "time"),
    ).toEqual({
      id: "time",
      entryFields: ["hyvaksytytAjominuutit", "ajoajanPisteet"],
      eraFields: ["alkoi", "hakumin", "ajomin"],
    });
    expect(
      Object.fromEntries(
        fieldSet.presentationGroups.map((group) => [
          group.id,
          {
            entry: group.entryFields,
            era: group.eraFields,
          },
        ]),
      ),
    ).toEqual({
      basic: {
        entry: [
          "koemaasto",
          "koemuoto",
          "koetyyppi",
          "lk",
          "omistajaSnapshot",
          "omistajanKotikuntaSnapshot",
        ],
        era: [],
      },
      time: {
        entry: ["hyvaksytytAjominuutit", "ajoajanPisteet"],
        era: ["alkoi", "hakumin", "ajomin"],
      },
      merit: {
        entry: ["haku", "hauk", "yva", "ansiopisteetYhteensa"],
        era: ["haku", "hauk", "yva"],
      },
      loss: {
        entry: ["hlo", "alo", "tappiopisteetYhteensa"],
        era: ["hlo", "alo"],
      },
      result: {
        entry: [
          "ke",
          "award",
          "points",
          "rank",
          "koiriaLuokassa",
          "huomautus",
          "huomautusTeksti",
        ],
        era: ["huomautusTeksti"],
      },
      judges: {
        entry: [
          "ryhmatuomariNimi",
          "palkintotuomariNimi",
          "judge",
          "ylituomariNumeroSnapshot",
        ],
        era: [],
      },
    });
  });

  it("presentation grouping neither adds nor removes visible fields", () => {
    for (const id of ["trw_post_20230801", null] as const) {
      const fieldSet = resolveResultCreateFieldSet(id);
      const groupedEntryFields = fieldSet.presentationGroups.flatMap(
        (group) => group.entryFields,
      );
      const groupedEraFields = fieldSet.presentationGroups.flatMap(
        (group) => group.eraFields,
      );

      expect(new Set(groupedEntryFields)).toEqual(fieldSet.entryFields);
      expect(groupedEntryFields).toHaveLength(new Set(groupedEntryFields).size);
      expect(new Set(groupedEraFields)).toEqual(fieldSet.eraFields);
      expect(groupedEraFields).toHaveLength(new Set(groupedEraFields).size);
    }
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
    const toPersistedValue = marker?.toPersistedValue;

    expect(marker?.inputKind).toBe("marker");
    expect(toPersistedValue).toBeTypeOf("function");
    if (!toPersistedValue) throw new Error("Marker persistence mapper missing");
    expect(toPersistedValue("1")).toBe("1");
    expect(toPersistedValue("0")).toBe("");
    expect(toPersistedValue("")).toBe("");
  });

  it.each([
    ...SEEDED_TRIAL_RULE_WINDOW_IDS.filter((id) => id !== "trw_post_20230801"),
    null,
    "unknown-window",
  ])("uses the warned show-all fallback for %s", (trialRuleWindowId) => {
    const fieldSet = resolveResultCreateFieldSet(trialRuleWindowId);

    expect(fieldSet.id).toBe("unverified-fallback");
    expect(fieldSet.verified).toBe(false);
    expect(fieldSet.yvaLabels).toBeUndefined();
    expect(fieldSet.entryFields.has("tja")).toBe(true);
    expect(fieldSet.eraFields.has("pin")).toBe(true);
    expect(
      fieldSet.lisatiedot.some((row) => row.koodi === "25" && row.osa === "b"),
    ).toBe(true);
    expect(
      fieldSet.lisatiedot.every(
        (row) =>
          row.useSemanticControl === undefined &&
          row.toPersistedValue === undefined &&
          row.valueHint === undefined,
      ),
    ).toBe(true);
  });
});
