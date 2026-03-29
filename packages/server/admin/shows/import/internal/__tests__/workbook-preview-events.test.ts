import { describe, expect, it } from "vitest";
import { buildPreviewEvents } from "../preview/build-preview-events";
import type { WorkbookParsedRow } from "../workbook-preview-types";

function createRow(overrides: Partial<WorkbookParsedRow>): WorkbookParsedRow {
  return {
    rowNumber: 2,
    eventLookupKey: "2025-01-01|helsinki|halli|all breed",
    eventDateIso: "2025-01-01",
    eventCity: "Helsinki",
    eventPlace: "Halli",
    eventType: "All Breed",
    accepted: true,
    issueCount: 0,
    itemCount: 1,
    registrationNo: "FI12345/24",
    dogName: "Kide",
    dogMatched: true,
    judge: "Judge",
    critiqueText: "Nice dog",
    classValue: "AVO",
    qualityValue: "ERI",
    resultItems: [],
    ...overrides,
  };
}

describe("buildPreviewEvents", () => {
  it("fills missing event metadata from a later row in the same group", () => {
    const events = buildPreviewEvents([
      createRow({
        rowNumber: 2,
        eventLookupKey: "group-1",
        eventDateIso: "",
        eventCity: "",
        eventPlace: "",
        eventType: "",
      }),
      createRow({
        rowNumber: 3,
        eventLookupKey: "group-1",
        eventDateIso: "2025-05-01",
        eventCity: "Helsinki",
        eventPlace: "Messukeskus",
        eventType: "All Breed",
        accepted: false,
      }),
    ]);

    expect(events).toEqual([
      expect.objectContaining({
        eventLookupKey: "group-1",
        eventDateIso: "2025-05-01",
        eventCity: "Helsinki",
        eventPlace: "Messukeskus",
        eventType: "All Breed",
        groupLabel: "Helsinki, Messukeskus",
        entries: [
          expect.objectContaining({ rowNumber: 2, status: "ACCEPTED" }),
          expect.objectContaining({ rowNumber: 3, status: "REJECTED" }),
        ],
      }),
    ]);
  });

  it("falls back to the row label when event city and place are missing", () => {
    const events = buildPreviewEvents([
      createRow({
        rowNumber: 7,
        eventLookupKey: "group-2",
        eventDateIso: "",
        eventCity: "",
        eventPlace: "",
        eventType: "",
      }),
      createRow({
        rowNumber: 8,
        eventLookupKey: "group-2",
        eventDateIso: "",
        eventCity: "",
        eventPlace: "",
        eventType: "",
      }),
    ]);

    expect(events).toEqual([
      expect.objectContaining({
        eventLookupKey: "group-2",
        groupLabel: "Rivi 7",
        entries: [
          expect.objectContaining({ rowNumber: 7 }),
          expect.objectContaining({ rowNumber: 8 }),
        ],
      }),
    ]);
  });
});
