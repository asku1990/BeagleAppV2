import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";
import { useShowManagementSelectedEventState } from "../use-show-management-selected-event-state";

const { useStateMock, useShowManagementMutationFlowMock } = vi.hoisted(() => ({
  useStateMock: vi.fn(),
  useShowManagementMutationFlowMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: useStateMock,
  };
});

vi.mock("../use-show-management-mutation-flow", () => ({
  useShowManagementMutationFlow: useShowManagementMutationFlowMock,
}));

const baseEntry: ManageShowEntry = {
  id: "entry-1",
  registrationNo: "FI12345/21",
  dogName: "Metsapolun Kide",
  judge: "Judge A",
  critiqueText: "",
  heightCm: "",
  classCode: "",
  qualityGrade: "",
  classPlacement: "",
  pupn: "",
  awards: [],
  classDisplay: "",
  qualityDisplay: "",
  pupnDisplay: "",
  awardsDisplay: [],
};

const baseEvent: ManageShowEvent = {
  id: "show-1",
  eventDate: "2025-12-14",
  eventPlace: "Akaa Haukkuhalli",
  eventCity: "Akaa",
  eventName: "Talvinayttely",
  eventType: "N",
  organizer: "Beagle Club",
  judge: "Judge A",
  entries: [baseEntry],
};

describe("useShowManagementSelectedEventState", () => {
  beforeEach(() => {
    useStateMock.mockReset();
    useShowManagementMutationFlowMock.mockReset();

    useStateMock.mockImplementationOnce((initial) => [initial, vi.fn()]);
    useShowManagementMutationFlowMock.mockReturnValue({
      isApplyingEvent: false,
      isSyncingAfterSave: false,
      applyingEntryId: null,
      isRemovingEntry: false,
      applyEventChanges: vi.fn(),
      applyEntryChanges: vi.fn(),
      confirmRemoveEntry: vi.fn(),
    });
  });

  it("uses parent-owned status text instead of creating local status state", () => {
    const onStatusTextChange = vi.fn();

    const result = useShowManagementSelectedEventState({
      selectedEvent: baseEvent,
      selectedEventUpdatedAt: 123,
      statusText: "Akaa Haukkuhalli11 tallennettu",
      onStatusTextChange,
      onSelectedEventIdChange: vi.fn(),
    });

    expect(useStateMock).toHaveBeenCalledTimes(1);
    expect(result.statusText).toBe("Akaa Haukkuhalli11 tallennettu");
    expect(useShowManagementMutationFlowMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onStatusTextChange,
      }),
    );
  });
});
