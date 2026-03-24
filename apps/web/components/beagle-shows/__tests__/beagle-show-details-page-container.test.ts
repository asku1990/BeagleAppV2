import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BeagleShowDetailsPageContainer } from "../beagle-show-details-page-container";

const { useBeagleShowDetailsQueryMock } = vi.hoisted(() => ({
  useBeagleShowDetailsQueryMock: vi.fn(),
}));

vi.mock("@/queries/public/beagle/shows", () => ({
  useBeagleShowDetailsQuery: useBeagleShowDetailsQueryMock,
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

describe("BeagleShowDetailsPageContainer", () => {
  beforeEach(() => {
    useBeagleShowDetailsQueryMock.mockReset();
    useBeagleShowDetailsQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("renders invalid state when show id is empty", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleShowDetailsPageContainer, { showId: "   " }),
    );

    expect(html).toContain("shows.details.state.invalid.title");
    expect(useBeagleShowDetailsQueryMock).toHaveBeenCalledWith("");
  });

  it("renders loading skeleton while query is loading", () => {
    useBeagleShowDetailsQueryMock.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleShowDetailsPageContainer, { showId: "show_1" }),
    );

    expect(html).toContain('data-slot="skeleton"');
  });

  it("renders not-found state for 404 errors", () => {
    useBeagleShowDetailsQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { status: 404, message: "Show not found." },
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleShowDetailsPageContainer, {
        showId: "show_missing",
      }),
    );

    expect(html).toContain("shows.details.state.notFound.title");
  });

  it("renders invalid state for 400 errors", () => {
    useBeagleShowDetailsQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { status: 400, message: "Invalid show id." },
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleShowDetailsPageContainer, { showId: "bad" }),
    );

    expect(html).toContain("shows.details.state.invalid.title");
  });

  it("renders details table when query succeeds", () => {
    useBeagleShowDetailsQueryMock.mockReturnValue({
      data: {
        show: {
          showId: "show_1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge Main",
          dogCount: 1,
        },
        items: [
          {
            id: "r_1",
            dogId: "dog_1",
            registrationNo: "FI-1/20",
            name: "Aatu",
            sex: "U",
            showType: "Ryhmänäyttely",
            classCode: "JUN",
            qualityGrade: "ERI",
            classPlacement: 1,
            pupn: "PU1",
            awards: ["SA"],
            critiqueText: "Excellent dog",
            heightCm: 40,
            judge: "Judge Main",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleShowDetailsPageContainer, { showId: "show_1" }),
    );

    expect(html).toContain("shows.details.title");
    expect(html).toContain("Helsinki");
    expect(html).toContain("FI-1/20");
    expect(html).toContain("Aatu");
    expect(html).toContain("40 cm");
    expect(html).toContain("shows.details.review.open");
    expect(html).toContain("shows.details.col.classResult");
    expect(html).toContain("shows.details.copy.all");
    expect(html).toContain('href="/beagle/dogs/dog_1"');
  });

  it("hides optional columns when every row is empty for them", () => {
    useBeagleShowDetailsQueryMock.mockReturnValue({
      data: {
        show: {
          showId: "show_1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge Main",
          dogCount: 1,
        },
        items: [
          {
            id: "r_2",
            dogId: null,
            registrationNo: "FI-9/20",
            name: "Snapshot Dog",
            sex: "-",
            showType: null,
            classCode: null,
            qualityGrade: null,
            classPlacement: null,
            pupn: null,
            awards: [],
            critiqueText: null,
            heightCm: null,
            judge: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleShowDetailsPageContainer, { showId: "show_1" }),
    );

    expect(html).toContain("shows.details.col.reg");
    expect(html).toContain("shows.details.col.name");
    expect(html).toContain("shows.details.col.sex");
    expect(html).not.toContain("shows.details.col.classResult");
    expect(html).not.toContain("shows.details.col.showType");
    expect(html).not.toContain("shows.details.col.className");
    expect(html).not.toContain("shows.details.col.qualityGrade");
    expect(html).not.toContain("shows.details.col.placement");
    expect(html).not.toContain("shows.details.col.pupn");
    expect(html).not.toContain("shows.details.col.awards");
    expect(html).not.toContain("shows.details.col.height");
    expect(html).not.toContain("shows.details.col.judge");
    expect(html).not.toContain("shows.details.col.reviewText");
  });

  it("renders unlinked entries without dog profile links", () => {
    useBeagleShowDetailsQueryMock.mockReturnValue({
      data: {
        show: {
          showId: "show_1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge Main",
          dogCount: 1,
        },
        items: [
          {
            id: "r_2",
            dogId: null,
            registrationNo: "FI-9/20",
            name: "Snapshot Dog",
            sex: "-",
            showType: null,
            classCode: null,
            qualityGrade: null,
            classPlacement: null,
            pupn: null,
            awards: [],
            critiqueText: null,
            heightCm: null,
            judge: "Judge Main",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleShowDetailsPageContainer, { showId: "show_1" }),
    );

    expect(html).toContain("FI-9/20");
    expect(html).toContain("Snapshot Dog");
    expect(html).not.toContain('href="/beagle/dogs/null"');
  });
});
