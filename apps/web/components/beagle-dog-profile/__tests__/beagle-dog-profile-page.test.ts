import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleDogProfilePage } from "../beagle-dog-profile-page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    locale: "fi",
    t: (key: string) => key,
  }),
}));

describe("BeagleDogProfilePage", () => {
  it("renders full profile cards for a known mock dog", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleDogProfilePage, { dogId: "dog_1" }),
    );

    expect(html).toContain("dog.profile.page.title");
    expect(html).toContain("Ajometsän Aada");
    expect(html).toContain("FI-11/24");
    expect(html).toContain("dog.profile.card.details.title");
    expect(html).toContain("dog.profile.card.pedigree.title");
    expect(html).toContain("dog.profile.card.shows.title");
    expect(html).toContain("dog.profile.card.trials.title");
  });

  it("renders not-found state for an unknown dog id", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleDogProfilePage, { dogId: "missing-dog" }),
    );

    expect(html).toContain("dog.profile.notFound.title");
    expect(html).toContain("dog.profile.notFound.description");
  });

  it("renders seeded profile when fixed mock data does not include the dog id", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleDogProfilePage, {
        dogId: "seed-1",
        seed: {
          name: "Seed Name",
          registrationNo: "FI-500/26",
          sex: "U",
          ekNo: 5,
          showCount: 1,
          trialCount: 2,
        },
      }),
    );

    expect(html).toContain("Seed Name");
    expect(html).toContain("FI-500/26");
    expect(html).toContain("Mock Show 1");
    expect(html).toContain("Mock Trial 1");
  });

  it("renders empty state text when shows or trials are missing", () => {
    const htmlWithNoTrials = renderToStaticMarkup(
      React.createElement(BeagleDogProfilePage, { dogId: "dog_3" }),
    );
    const htmlWithNoShows = renderToStaticMarkup(
      React.createElement(BeagleDogProfilePage, { dogId: "dog_2" }),
    );

    expect(htmlWithNoTrials).toContain("dog.profile.empty.trials");
    expect(htmlWithNoShows).toContain("dog.profile.empty.shows");
  });
});
