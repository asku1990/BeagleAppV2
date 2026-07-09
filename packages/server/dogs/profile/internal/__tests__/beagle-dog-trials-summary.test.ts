import { describe, expect, it } from "vitest";
import type { BeagleTrialDogSummarySourceRowDb } from "@beagle/db";
import { getTrialBusinessDateStartUtc } from "@server/trials/core";
import { buildBeagleDogTrialsSummary } from "../beagle-dog-trials-summary";

function date(value: string): Date {
  const parsed = getTrialBusinessDateStartUtc(value);
  if (!parsed) {
    throw new Error(`Invalid test date: ${value}`);
  }
  return parsed;
}

function row(
  input: Partial<BeagleTrialDogSummarySourceRowDb>,
): BeagleTrialDogSummarySourceRowDb {
  return {
    piste: null,
    haku: null,
    hauk: null,
    yva: null,
    hlo: null,
    alo: null,
    pin: null,
    koepaiva: date("2006-09-01"),
    trialRuleWindowId: "trw_range_2005_2011",
    ...input,
  };
}

describe("buildBeagleDogTrialsSummary", () => {
  it("builds v1-style all-trials summary rows for the dog and whole breed", () => {
    const result = buildBeagleDogTrialsSummary({
      dogName: "Ajometsan Aada",
      dogRows: [
        row({
          piste: 80,
          haku: 8,
          hauk: 6,
          yva: 5,
          hlo: 0,
          alo: 0,
          pin: 4,
          trialRuleWindowId: "trw_range_2005_2011",
        }),
        row({
          piste: null,
          haku: 6,
          hauk: 0,
          yva: 0,
          hlo: 1,
          alo: 2,
          pin: 1,
          koepaiva: date("2004-09-01"),
          trialRuleWindowId: "trw_range_2002_2005",
        }),
      ],
      breedRows: [
        row({
          piste: 90,
          haku: 9,
          hauk: 7,
          yva: 5,
          hlo: 0,
          alo: 0,
          pin: 5,
          trialRuleWindowId: "trw_range_2005_2011",
        }),
        row({
          piste: 70,
          haku: 5,
          hauk: 0,
          yva: 4,
          hlo: 2,
          alo: 1,
          pin: 3,
          koepaiva: date("2001-09-01"),
          trialRuleWindowId: "trw_pre_20020801",
        }),
      ],
    });

    expect(result).toEqual({
      allTrials: [
        {
          label: "dog",
          name: "Ajometsan Aada",
          count: 2,
          points: 40,
          haku: 7,
          hauk: 6,
          yva: 5,
          hlo: 0.5,
          alo: 1,
          mi: 4,
          pmi: 1,
        },
        {
          label: "breed",
          name: "KOKO ROTU",
          count: 2,
          points: 80,
          haku: 7,
          hauk: 7,
          yva: 4.5,
          hlo: 1,
          alo: 0.5,
          mi: 5,
          pmi: 3,
        },
      ],
    });
  });

  it("uses rule windows for Mi/PMi and falls back to dates only for missing windows", () => {
    const result = buildBeagleDogTrialsSummary({
      dogName: "Ajometsan Aada",
      dogRows: [
        row({
          pin: 1,
          koepaiva: date("2006-09-01"),
          trialRuleWindowId: "trw_range_2002_2005",
        }),
        row({
          pin: 4,
          koepaiva: date("2004-09-01"),
          trialRuleWindowId: "trw_range_2005_2011",
        }),
        row({
          pin: 99,
          trialRuleWindowId: "trw_post_20110801",
        }),
        row({
          pin: 100,
          trialRuleWindowId: "trw_post_20230801",
        }),
        row({
          pin: 2,
          koepaiva: date("2004-09-01"),
          trialRuleWindowId: null,
        }),
        row({
          pin: 5,
          koepaiva: date("2006-09-01"),
          trialRuleWindowId: null,
        }),
        row({
          pin: 200,
          koepaiva: date("2012-09-01"),
          trialRuleWindowId: null,
        }),
        row({
          pin: 3,
          koepaiva: date("2004-09-01"),
          trialRuleWindowId: "unknown-window",
        }),
        row({
          pin: 6,
          koepaiva: date("2006-09-01"),
          trialRuleWindowId: "unknown-window",
        }),
        row({
          pin: 300,
          koepaiva: date("2012-09-01"),
          trialRuleWindowId: "unknown-window",
        }),
      ],
      breedRows: [],
    });

    expect(result.allTrials[0]).toMatchObject({
      label: "dog",
      count: 10,
      mi: 5,
      pmi: 2,
    });
    expect(result.allTrials[1]).toMatchObject({
      label: "breed",
      count: 0,
      mi: null,
      pmi: null,
    });
  });
});
