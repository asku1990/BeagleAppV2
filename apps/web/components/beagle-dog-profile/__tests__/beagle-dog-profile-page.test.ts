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
  it("renders full profile cards", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleDogProfilePage, {
        profile: {
          id: "dog_1",
          name: "Ajometsan Aada",
          title: null,
          registrationNo: "FI-11/24",
          registrationNos: ["FI-11/24", "FI-22/24"],
          birthDate: "2020-01-01",
          sex: "N",
          color: null,
          ekNo: 11,
          inbreedingCoefficientPct: null,
          sire: {
            id: "sire_1",
            name: "Sire",
            registrationNo: "SIRE-1",
            ekNo: 101,
          },
          dam: {
            id: "dam_1",
            name: "Dam",
            registrationNo: "DAM-1",
            ekNo: null,
          },
          pedigree: [
            {
              generation: 1,
              cards: [
                {
                  id: "g1",
                  sire: {
                    id: "sire_1",
                    name: "Sire",
                    registrationNo: "SIRE-1",
                    ekNo: 101,
                  },
                  dam: {
                    id: "dam_1",
                    name: "Dam",
                    registrationNo: "DAM-1",
                    ekNo: null,
                  },
                },
              ],
            },
          ],
          offspringSummary: { litterCount: 1, puppyCount: 2 },
          siblingsSummary: { siblingCount: 1 },
          siblings: [
            {
              id: "sibling_1",
              dogId: "sibling_1",
              name: "Sibling One",
              registrationNo: "FI-29/24",
              sex: "U",
              ekNo: 211,
              trialCount: 3,
              showCount: 1,
              litterCount: 0,
            },
          ],
          litters: [
            {
              id: "litter_1",
              birthDate: "2024-05-01",
              otherParent: {
                id: "co_parent_1",
                name: "Co Parent",
                registrationNo: "CO-1",
                ekNo: null,
              },
              puppyCount: 2,
              puppies: [
                {
                  id: "puppy_1",
                  dogId: "puppy_1",
                  name: "Puppy One",
                  registrationNo: "FI-30/24",
                  sex: "U",
                  ekNo: 301,
                  trialCount: 4,
                  showCount: 2,
                  litterCount: 1,
                },
                {
                  id: "puppy_2",
                  dogId: "puppy_2",
                  name: "Puppy Two",
                  registrationNo: "FI-31/24",
                  sex: "N",
                  ekNo: null,
                  trialCount: 0,
                  showCount: 0,
                  litterCount: 0,
                },
              ],
            },
          ],
          shows: [
            {
              id: "show1",
              showId: "show-route-1",
              place: "Helsinki",
              date: "2024-01-01",
              result: "ERI",
              judge: "Judge",
              heightCm: 39,
            },
          ],
          trials: [
            {
              id: "trial1",
              trialId: "trial-route-1",
              place: "Turku",
              date: "2024-02-01",
              weather: "P",
              className: "VOI",
              rank: "1",
              points: 85.5,
              award: "BEAJ-1",
              judge: "Judge A",
              haku: 4,
              hauk: 4,
              yva: 4,
              hlo: 0,
              alo: 0,
              tja: 0,
              pin: 8,
            },
          ],
        },
      }),
    );

    expect(html).toContain("dog.profile.page.title");
    expect(html).toContain("Ajometsan Aada");
    expect(html).toContain("FI-11/24");
    expect(html).not.toContain("dog.profile.page.backToSearch");
    expect(html).toContain("dog.profile.card.details.title");
    expect(html).toContain("dog.profile.card.lineage.title");
    expect(html).toContain("dog.profile.card.siblings.title");
    expect(html).toContain("dog.profile.card.litters.title");
    expect(html).toContain("dog.profile.card.shows.title");
    expect(html).toContain("dog.profile.card.trials.title");
    expect(html).toContain("dog.profile.litters.count.litters");
    expect(html).toContain("dog.profile.litters.count.puppies");
    expect(html).toContain("dog.profile.litters.col.registrationNo");
    expect(html).toContain("dog.profile.litters.col.name");
    expect(html).toContain("dog.profile.litters.col.sex");
    expect(html).toContain("dog.profile.litters.col.color");
    expect(html).toContain("dog.profile.litters.col.trials");
    expect(html).toContain("dog.profile.litters.col.shows");
    expect(html).toContain("dog.profile.litters.col.litters");
    expect(html).toContain("dog.profile.litters.col.ekNo");
    expect(html).toContain("dog.profile.siblings.count.siblings");
    expect(html).toContain("CO-1 Co Parent");
    expect(html).toContain("FI-29/24");
    expect(html).toContain("Sibling One");
    expect(html).toContain("FI-30/24");
    expect(html).toContain("Puppy One");
    expect(html).toContain("FI-31/24");
    expect(html).toContain("Puppy Two");
    expect(html).toContain("dog.profile.field.comingSoon");
    expect(html).toContain("301");
    expect(html).toContain("dog.profile.shows.copy.button");
    expect(html).toContain("dog.profile.trials.copy.button");
    expect(html).toContain('href="/beagle/shows/show-route-1"');
    expect(html).toContain('href="/beagle/trials/trial-route-1"');
    expect(html).toContain('href="/beagle/dogs/sire_1"');
    expect(html).toContain('href="/beagle/dogs/dam_1"');
    expect(html).toContain('href="/beagle/dogs/co_parent_1"');
    expect(html).toContain('href="/beagle/dogs/sibling_1"');
    expect(html).toContain('href="/beagle/dogs/puppy_1"');
    expect(html).toContain('href="/beagle/dogs/puppy_2"');
    expect(html).toContain("(EK: 101)");
    expect(html).not.toContain("(EK: -)");
  });

  it("renders empty state text when shows or trials are missing", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleDogProfilePage, {
        profile: {
          id: "dog_2",
          name: "No Results",
          title: null,
          registrationNo: "FI-2/24",
          registrationNos: ["FI-2/24"],
          birthDate: null,
          sex: "U",
          color: null,
          ekNo: null,
          inbreedingCoefficientPct: null,
          sire: null,
          dam: null,
          pedigree: [
            { generation: 1, cards: [{ id: "g1", sire: null, dam: null }] },
          ],
          offspringSummary: { litterCount: 0, puppyCount: 0 },
          siblingsSummary: { siblingCount: 0 },
          siblings: [],
          litters: [],
          shows: [],
          trials: [],
        },
      }),
    );

    expect(html).toContain("dog.profile.empty.trials");
    expect(html).toContain("dog.profile.empty.shows");
    expect(html).toContain("dog.profile.empty.litters");
    expect(html).toContain("dog.profile.empty.siblings");
    expect(html).toContain("dog.profile.sex.unknown");
    expect(html).not.toContain("dog.profile.shows.copy.button");
    expect(html).not.toContain("dog.profile.trials.copy.button");
  });
});
