import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";
import { useShowManagementMutationFlow } from "../use-show-management-mutation-flow";

const {
  useEffectMock,
  useStateMock,
  toastSuccessMock,
  toastErrorMock,
  useUpdateAdminShowEventMutationMock,
  useUpdateAdminShowEntryMutationMock,
  useDeleteAdminShowEntryMutationMock,
} = vi.hoisted(() => ({
  useEffectMock: vi.fn(),
  useStateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  useUpdateAdminShowEventMutationMock: vi.fn(),
  useUpdateAdminShowEntryMutationMock: vi.fn(),
  useDeleteAdminShowEntryMutationMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useEffect: useEffectMock,
    useState: useStateMock,
  };
});

vi.mock("@/components/ui/sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/queries/admin/shows", () => ({
  useUpdateAdminShowEventMutation: useUpdateAdminShowEventMutationMock,
  useUpdateAdminShowEntryMutation: useUpdateAdminShowEntryMutationMock,
  useDeleteAdminShowEntryMutation: useDeleteAdminShowEntryMutationMock,
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

describe("useShowManagementMutationFlow", () => {
  beforeEach(() => {
    useEffectMock.mockReset();
    useStateMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    useUpdateAdminShowEventMutationMock.mockReset();
    useUpdateAdminShowEntryMutationMock.mockReset();
    useDeleteAdminShowEntryMutationMock.mockReset();

    useEffectMock.mockImplementation(() => undefined);
    useStateMock
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()]);

    useUpdateAdminShowEntryMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useDeleteAdminShowEntryMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
  });

  it("shows success toast immediately when event save keeps the same show id", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      showId: "show-1",
      eventDate: "2025-12-14",
      eventPlace: "Akaa Haukkuhalli",
      eventCity: "Akaa",
      eventName: "Talvinayttely",
      eventType: "N",
      organizer: "Beagle Club",
      judge: "Judge A",
    });
    useUpdateAdminShowEventMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    const onSelectedEventIdChange = vi.fn();
    const onStatusTextChange = vi.fn();
    const hook = useShowManagementMutationFlow({
      selectedEvent: baseEvent,
      selectedEventUpdatedAt: 123,
      onSelectedEventIdChange,
      onStatusTextChange,
      onRemoveConfirmed: vi.fn(),
    });

    await expect(hook.applyEventChanges(baseEvent)).resolves.toBe(true);

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "admin.shows.manage.mutation.toast.eventSaved",
    );
    expect(onStatusTextChange).toHaveBeenCalledWith(
      "Akaa Haukkuhalli admin.shows.manage.mutation.status.eventSavedSuffix",
    );
    expect(onSelectedEventIdChange).not.toHaveBeenCalled();
  });

  it("switches selected event and shows success toast when event save changes show id", async () => {
    const setPendingEventSelectionSync = vi.fn();
    const mutateAsync = vi.fn().mockResolvedValue({
      showId: "show-2",
      eventDate: "2025-12-01",
      eventPlace: "Akaa Haukkuhalli11",
      eventCity: "Akaa",
      eventName: "Talvinayttely",
      eventType: "N",
      organizer: "Beagle Club",
      judge: "Judge A",
    });
    useStateMock
      .mockReset()
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [
        initial,
        setPendingEventSelectionSync,
      ]);
    useUpdateAdminShowEventMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    const onSelectedEventIdChange = vi.fn();
    const onStatusTextChange = vi.fn();
    const hook = useShowManagementMutationFlow({
      selectedEvent: baseEvent,
      selectedEventUpdatedAt: 123,
      onSelectedEventIdChange,
      onStatusTextChange,
      onRemoveConfirmed: vi.fn(),
    });

    await expect(
      hook.applyEventChanges({
        ...baseEvent,
        eventDate: "2025-12-01",
        eventPlace: "Akaa Haukkuhalli11",
      }),
    ).resolves.toBe(true);

    expect(onSelectedEventIdChange).toHaveBeenCalledWith("show-2");
    expect(setPendingEventSelectionSync).toHaveBeenCalledWith({
      targetShowId: "show-2",
      baselineUpdatedAt: 123,
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "admin.shows.manage.mutation.toast.eventSaved",
    );
    expect(onStatusTextChange).toHaveBeenCalledWith(
      "Akaa Haukkuhalli11 admin.shows.manage.mutation.status.eventSavedSuffix",
    );
  });

  it("blocks entry saves while an event id switch is still syncing", async () => {
    const updateEntryMutateAsync = vi.fn();
    useStateMock
      .mockReset()
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce(() => [
        { targetShowId: "show-2", baselineUpdatedAt: 123 },
        vi.fn(),
      ]);
    useUpdateAdminShowEventMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useUpdateAdminShowEntryMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: updateEntryMutateAsync,
    });

    const hook = useShowManagementMutationFlow({
      selectedEvent: baseEvent,
      selectedEventUpdatedAt: 123,
      onSelectedEventIdChange: vi.fn(),
      onStatusTextChange: vi.fn(),
      onRemoveConfirmed: vi.fn(),
    });

    await expect(hook.applyEntryChanges(baseEntry)).resolves.toBe(false);
    expect(updateEntryMutateAsync).not.toHaveBeenCalled();
  });
});
