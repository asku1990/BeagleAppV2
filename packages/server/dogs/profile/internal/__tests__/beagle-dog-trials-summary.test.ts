import { describe, expect, it } from "vitest";
import type { BeagleTrialDogSummarySourceRowDb } from "@beagle/db";
import { buildBeagleDogTrialsSummary } from "../beagle-dog-trials-summary";

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
          trialRuleWindowId: "trw_range_2002_2005",
        }),
      ],
      breedSummary: {
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

  it("uses rule windows for Mi/PMi and ignores missing or unknown windows", () => {
    const result = buildBeagleDogTrialsSummary({
      dogName: "Ajometsan Aada",
      dogRows: [
        row({
          pin: 1,
          trialRuleWindowId: "trw_range_2002_2005",
        }),
        row({
          pin: 4,
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
          trialRuleWindowId: null,
        }),
        row({
          pin: 3,
          trialRuleWindowId: "unknown-window",
        }),
      ],
      breedSummary: {
        count: 0,
        points: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        mi: null,
        pmi: null,
      },
    });

    expect(result.allTrials[0]).toMatchObject({
      label: "dog",
      count: 6,
      mi: 4,
      pmi: 1,
    });
    expect(result.allTrials[1]).toMatchObject({
      label: "breed",
      count: 0,
      mi: null,
      pmi: null,
    });
  });
});
