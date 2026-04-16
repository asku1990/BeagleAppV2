import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminTrialDetailsPageClient } from "../admin-trial-details-page-client";

const { useAdminTrialQueryMock } = vi.hoisted(() => ({
  useAdminTrialQueryMock: vi.fn(),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/queries/admin/trials", () => ({
  useAdminTrialQuery: useAdminTrialQueryMock,
  isAdminTrialQueryError: (error: unknown) =>
    Boolean(
      error &&
      typeof error === "object" &&
      "errorCode" in error &&
      typeof (error as { errorCode?: unknown }).errorCode === "string",
    ),
}));

vi.mock("@/lib/admin/core/date", () => ({
  formatDateForFinland: (value: string | null | undefined) => value ?? "-",
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => React.createElement("hr"),
}));

vi.mock("@/components/listing", () => ({
  ListingSectionShell: ({
    title,
    subtitle,
    children,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
  }) => React.createElement("section", null, title, subtitle, children),
}));

describe("AdminTrialDetailsPageClient", () => {
  beforeEach(() => {
    useAdminTrialQueryMock.mockReset();
    useAdminTrialQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("renders invalid state for empty trial id", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, { trialId: "   " }),
    );

    expect(html).toContain("admin.trials.detail.state.invalid");
  });

  it("renders loading state", () => {
    useAdminTrialQueryMock.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, { trialId: "trial-1" }),
    );

    expect(html).toContain("admin.trials.detail.state.loading");
  });

  it("renders not found state when query returns TRIAL_NOT_FOUND error", () => {
    useAdminTrialQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: {
        message: "Trial not found.",
        errorCode: "TRIAL_NOT_FOUND",
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, {
        trialId: "trial-404",
      }),
    );

    expect(html).toContain("admin.trials.detail.state.notFound");
    expect(html).not.toContain("Trial not found.");
  });

  it("renders grouped detail fields and raw fallback", () => {
    useAdminTrialQueryMock.mockReturnValue({
      data: {
        trial: {
          trialId: "trial-1",
          dogId: null,
          dogName: "Rex",
          registrationNo: "FI12345/21",
          sklKoeId: 54321,
          entryKey: "entry-1",
          eventDate: "2026-04-14",
          eventName: "Kevätkoe",
          eventPlace: "Helsinki",
          kennelDistrict: null,
          kennelDistrictNo: "01",
          ke: "KE",
          lk: "A",
          pa: "VOI1",
          piste: 88.5,
          sija: "2",
          haku: 12,
          hauk: 10.5,
          yva: 9,
          hlo: 1,
          alo: 2,
          tja: 3,
          pin: 4,
          judge: "Judge One",
          legacyFlag: "L",
          rawPayloadJson: null,
          rawPayloadAvailable: false,
          createdAt: "2026-04-14T10:00:00.000Z",
          updatedAt: "2026-04-14T10:30:00.000Z",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, { trialId: "trial-1" }),
    );

    expect(html).toContain("admin.trials.detail.title");
    expect(html).toContain("admin.trials.detail.section.title");
    expect(html).toContain("admin.trials.detail.sections.trialInfo");
    expect(html).toContain("admin.trials.detail.sections.dogInfo");
    expect(html).toContain("admin.trials.detail.sections.resultSummary");
    expect(html).toContain("admin.trials.detail.sections.scoreBreakdown");
    expect(html).toContain("admin.trials.detail.sections.metadata");
    expect(html).toContain("admin.trials.detail.sections.raw");
    expect(html).toContain("admin.trials.validation.title");
    expect(html).toContain("admin.trials.validation.sections.missing");
    expect(html).toContain("admin.trials.validation.sections.incomplete");
    expect(html).toContain("admin.trials.detail.fields.sklKoeId");
    expect(html).toContain("admin.trials.detail.fields.entryKey");
    expect(html).toContain("kennelpiiri");
    expect(html).toContain("Rex");
    expect(html).toContain("54321");
    expect(html).toContain("entry-1");
    expect(html).toContain("admin.trials.detail.raw.unavailable");
  });
});
