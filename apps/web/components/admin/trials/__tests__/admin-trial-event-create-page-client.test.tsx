import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { submitAdminTrialEventCreation } from "@/lib/admin/trials";
import { AdminTrialEventCreatePageClient } from "../admin-trial-event-create-page-client";

const { formDraftRef, mutationState, mutateAsyncMock, replaceMock } =
  vi.hoisted(() => ({
    formDraftRef: {
      current: null as { eventDate: string } | null,
    },
    mutationState: { isPending: false },
    mutateAsyncMock: vi.fn(),
    replaceMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));
vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/queries/admin/trials", () => ({
  useCreateAdminTrialEventMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: mutationState.isPending,
  }),
}));
vi.mock("../admin-trial-event-form-fields", () => ({
  AdminTrialEventFormFields: (props: { draft: { eventDate: string } }) => {
    formDraftRef.current = props.draft;
    return React.createElement("div", null, "event-form-fields");
  },
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

describe("AdminTrialEventCreatePageClient", () => {
  beforeEach(() => {
    mutationState.isPending = false;
    formDraftRef.current = null;
    mutateAsyncMock.mockReset();
    replaceMock.mockReset();
  });

  it("renders the full-page form and cancel destination", () => {
    const html = renderToStaticMarkup(
      <AdminTrialEventCreatePageClient initialEventDate="2026-07-21" />,
    );

    expect(html).toContain("admin.trials.manage.create.title");
    expect(html).toContain("event-form-fields");
    expect(html).toContain('href="/admin/trials"');
    expect(html).toContain("admin.trials.manage.create.save");
    expect(formDraftRef.current?.eventDate).toBe("2026-07-21");
  });

  it("disables submission while the create mutation is pending", () => {
    mutationState.isPending = true;

    const html = renderToStaticMarkup(
      <AdminTrialEventCreatePageClient initialEventDate="2026-07-21" />,
    );

    expect(html).toContain("admin.trials.manage.create.saving");
    expect(html).toContain('type="submit" disabled=""');
  });

  const validDraft = {
    eventDate: " 2026-07-21 ",
    eventPlace: " Helsinki ",
    jarjestaja: " Club ",
    ylituomari: " Judge ",
    ylituomariNumero: " 123 ",
    ytKertomus: " Report ",
    kennelpiiri: " District ",
    kennelpiirinro: " 10 ",
    sklKoeId: " 456 ",
  };
  const t = (key: string) => key;

  it.each([
    [
      "event date",
      { eventDate: " " },
      "admin.trials.manage.eventModal.validation.invalidDate",
    ],
    [
      "event place",
      { eventPlace: " " },
      "admin.trials.manage.eventModal.validation.requiredPlace",
    ],
    [
      "SKL id",
      { sklKoeId: "0" },
      "admin.trials.manage.eventModal.validation.invalidSklKoeId",
    ],
  ])(
    "validates the required %s before mutation",
    async (_label, override, error) => {
      const setErrorText = vi.fn();

      await submitAdminTrialEventCreation({
        draft: { ...validDraft, ...override },
        isPending: false,
        mutateAsync: mutateAsyncMock,
        replace: replaceMock,
        setErrorText,
        t,
      });

      expect(mutateAsyncMock).not.toHaveBeenCalled();
      expect(setErrorText).toHaveBeenLastCalledWith(error);
    },
  );

  it("normalizes the request and navigates to the exact workspace", async () => {
    mutateAsyncMock.mockResolvedValue({ trialEventId: "event/with spaces" });

    await submitAdminTrialEventCreation({
      draft: validDraft,
      isPending: false,
      mutateAsync: mutateAsyncMock,
      replace: replaceMock,
      setErrorText: vi.fn(),
      t,
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      eventDate: "2026-07-21",
      eventPlace: "Helsinki",
      jarjestaja: "Club",
      ylituomari: "Judge",
      ylituomariNumero: "123",
      ytKertomus: "Report",
      kennelpiiri: "District",
      kennelpiirinro: "10",
      sklKoeId: 456,
    });
    expect(replaceMock).toHaveBeenCalledWith(
      "/admin/trials/event%2Fwith%20spaces",
    );
  });

  it("preserves the draft and shows localized duplicate feedback", async () => {
    const draft = { ...validDraft };
    const originalDraft = { ...draft };
    const setErrorText = vi.fn();
    mutateAsyncMock.mockRejectedValue(
      new AdminMutationError("Conflict", "SKL_KOE_ID_CONFLICT"),
    );

    await submitAdminTrialEventCreation({
      draft,
      isPending: false,
      mutateAsync: mutateAsyncMock,
      replace: replaceMock,
      setErrorText,
      t,
    });

    expect(draft).toEqual(originalDraft);
    expect(setErrorText).toHaveBeenLastCalledWith(
      "admin.trials.manage.create.conflict",
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("maps unexpected failures and blocks duplicate pending submissions", async () => {
    const setErrorText = vi.fn();
    mutateAsyncMock.mockRejectedValue(new Error("boom"));

    await submitAdminTrialEventCreation({
      draft: validDraft,
      isPending: false,
      mutateAsync: mutateAsyncMock,
      replace: replaceMock,
      setErrorText,
      t,
    });
    expect(setErrorText).toHaveBeenLastCalledWith(
      "admin.trials.manage.create.error",
    );

    mutateAsyncMock.mockClear();
    setErrorText.mockClear();
    await submitAdminTrialEventCreation({
      draft: validDraft,
      isPending: true,
      mutateAsync: mutateAsyncMock,
      replace: replaceMock,
      setErrorText,
      t,
    });
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(setErrorText).not.toHaveBeenCalled();
  });
});
