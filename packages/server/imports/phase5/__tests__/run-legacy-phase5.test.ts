import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createImportRunMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  markImportRunFinishedMock,
  markImportRunRunningMock,
  prismaMock,
} = vi.hoisted(() => {
  const legacyRows = Array.from({ length: 1001 }, (_, index) => ({
    rekno: `FI${String(index + 1).padStart(5, "0")}/21`,
    tappa: "Lahti",
    tappv: "20260115",
    kennelpiiri: null,
    kennelpiirinro: null,
    tuom1: "Judge One",
    ke: null,
    lk: null,
    pa: null,
    piste: null,
    sija: index === 0 ? "weird" : "1|3",
    haku: null,
    hauk: null,
    yva: null,
    hlo: null,
    alo: null,
    tja: null,
    pin: null,
    vara: null,
    rawPayloadJson: JSON.stringify({ rekno: index + 1 }),
  }));

  let eventCounter = 0;
  let entryCounter = 0;

  return {
    createImportRunMock: vi.fn().mockResolvedValue({ id: "run-1" }),
    createImportRunIssueMock: vi.fn(),
    createImportRunIssuesBulkMock: vi.fn(),
    markImportRunFinishedMock: vi
      .fn()
      .mockImplementation(async (_id, input) => ({
        id: "run-1",
        kind: "LEGACY_PHASE5",
        status: input.status,
        dogsUpserted: input.dogsUpserted,
        ownersUpserted: input.ownersUpserted,
        ownershipsUpserted: input.ownershipsUpserted,
        trialResultsUpserted: input.trialResultsUpserted,
        showResultsUpserted: input.showResultsUpserted,
        errorsCount: input.errorsCount,
        errorSummary: input.errorSummary,
        startedAt: new Date("2026-04-23T00:00:00.000Z"),
        finishedAt: new Date("2026-04-23T00:10:00.000Z"),
        createdByUserId: null,
        createdAt: new Date("2026-04-23T00:00:00.000Z"),
        updatedAt: new Date("2026-04-23T00:10:00.000Z"),
        issuesCount: 1,
      })),
    markImportRunRunningMock: vi.fn(),
    prismaMock: {
      legacyAkoeall: {
        findMany: vi.fn().mockResolvedValue(legacyRows),
      },
      legacyBealt: { findMany: vi.fn().mockResolvedValue([]) },
      legacyBealt0: { findMany: vi.fn().mockResolvedValue([]) },
      legacyBealt1: { findMany: vi.fn().mockResolvedValue([]) },
      legacyBealt2: { findMany: vi.fn().mockResolvedValue([]) },
      legacyBealt3: { findMany: vi.fn().mockResolvedValue([]) },
      trialRuleWindow: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn().mockResolvedValue(undefined),
      trialEraLisatieto: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      trialEra: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn(),
      },
      trialEntry: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi
          .fn()
          .mockImplementation(async () => ({ id: `entry-${++entryCounter}` })),
      },
      trialEvent: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi
          .fn()
          .mockImplementation(async () => ({ id: `event-${++eventCounter}` })),
      },
      dogRegistration: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    },
  };
});

vi.mock("@beagle/db", () => ({
  ImportKind: {
    LEGACY_PHASE5: "LEGACY_PHASE5",
  },
  TrialSourceTag: {
    LEGACY_AKOEALL: "LEGACY_AKOEALL",
  },
  TrialEntryKoetyyppi: {
    NORMAL: "NORMAL",
    KOKOKAUDENKOE: "KOKOKAUDENKOE",
    PITKAKOE: "PITKAKOE",
  },
  createImportRun: createImportRunMock,
  createImportRunIssue: createImportRunIssueMock,
  createImportRunIssuesBulk: createImportRunIssuesBulkMock,
  markImportRunFinished: markImportRunFinishedMock,
  markImportRunRunning: markImportRunRunningMock,
  prisma: prismaMock,
}));

import { runLegacyPhase5 } from "../run-legacy-phase5";

describe("runLegacyPhase5", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("buffers unclear SIJA warnings and logs batch progress at 1000 rows", async () => {
    const log = vi.fn();

    const result = await runLegacyPhase5(undefined, { log });

    expect(result.status).toBe(202);
    expect(createImportRunIssueMock).not.toHaveBeenCalled();
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          code: "TRIAL_PHASE5_UNCLEAR_SIJA",
          registrationNo: "FI00001/21",
        }),
      ]),
      expect.any(Object),
    );
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("[stage:project-runtime] progress 1000/1001"),
    );
  });
});
