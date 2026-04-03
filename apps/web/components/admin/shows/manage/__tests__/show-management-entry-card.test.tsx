import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createManageShowAward } from "@web/lib/admin/shows/manage";
import { ShowManagementEntryCard } from "../show-management-entry-card";

vi.mock("@web/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement("button", props as Record<string, string>, children),
}));

vi.mock("@web/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@web/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) =>
    React.createElement("input", props as Record<string, string>),
}));

describe("ShowManagementEntryCard", () => {
  it("allows placements beyond the old 1..4 select list", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowManagementEntryCard, {
        entry: {
          id: "entry-1",
          registrationNo: "FI12345/21",
          dogName: "Metsapolun Kide",
          judge: "Judge",
          critiqueText: "Critique",
          heightCm: "38",
          classCode: "AVO",
          qualityGrade: "ERI",
          classPlacement: "8",
          pupn: "PU8",
          awards: [createManageShowAward("award-1", "SERT")],
          classDisplay: "AVO 8",
          qualityDisplay: "ERI",
          pupnDisplay: "PU8",
          awardsDisplay: ["SERT"],
        },
        resultOptions: {
          classOptions: [{ value: "AVO", label: "AVO" }],
          qualityOptions: [{ value: "ERI", label: "ERI" }],
          awardOptions: [{ value: "SERT", label: "SERT" }],
          pupnOptions: [{ value: "PU8", label: "PU8" }],
        },
        isDirty: false,
        onEntryFieldChange: () => undefined,
        onAddAward: () => undefined,
        onRemoveAward: () => undefined,
        onRemove: () => undefined,
        onApply: () => undefined,
      }),
    );

    expect(html).toContain('value="8"');
    expect(html).toContain('selected="">PU');
    expect(html).toContain('value="-"');
    expect(html).toContain("Placement");
    expect(html).toContain("Example: `AVO 8`.");
    expect(html).toContain("AVO 8");
    expect(html).toContain("ERI");
    expect(html).toContain("PU8");
    expect(html).toContain("SERT");
  });

  it("keeps unknown class and quality values selectable", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowManagementEntryCard, {
        entry: {
          id: "entry-2",
          registrationNo: "FI54321/20",
          dogName: "Retired Value Dog",
          judge: "Judge",
          critiqueText: "",
          heightCm: "",
          classCode: "LEGACY-CLASS",
          qualityGrade: "LEGACY-QUALITY",
          classPlacement: "",
          pupn: "",
          awards: [],
          classDisplay: "-",
          qualityDisplay: "-",
          pupnDisplay: "-",
          awardsDisplay: [],
        },
        resultOptions: {
          classOptions: [{ value: "AVO", label: "AVO" }],
          qualityOptions: [{ value: "ERI", label: "ERI" }],
          awardOptions: [],
          pupnOptions: [],
        },
        isDirty: false,
        onEntryFieldChange: () => undefined,
        onAddAward: () => undefined,
        onRemoveAward: () => undefined,
        onRemove: () => undefined,
        onApply: () => undefined,
      }),
    );

    expect(html).toContain(">LEGACY-CLASS<");
    expect(html).toContain(">LEGACY-QUALITY<");
  });
});
