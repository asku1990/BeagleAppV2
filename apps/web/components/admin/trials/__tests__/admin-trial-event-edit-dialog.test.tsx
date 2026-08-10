import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialEventEditDialog } from "../admin-trial-event-edit-dialog";
import {
  parseSklKoeIdDraft,
  toTrialEventDraft,
} from "../admin-trial-event-edit-dialog-helpers";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/admin", () => ({
  AdminFormModalShell: ({
    title,
    ariaLabel,
    footer,
    children,
  }: {
    title: React.ReactNode;
    ariaLabel: string;
    footer: React.ReactNode;
    children: React.ReactNode;
  }) =>
    React.createElement(
      "section",
      { "aria-label": ariaLabel },
      title,
      children,
      footer,
    ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("button", props, children),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) =>
    React.createElement("input", props),
}));

const event1 = {
  trialEventId: "event-1",
  trialRuleWindowId: "trw_post_20230801",
  eventDate: "2026-04-14",
  eventPlace: "Helsinki",
  eventName: "Kevatkoe",
  jarjestaja: "Kerho",
  ylituomari: "Judge",
  ylituomariNumero: "123",
  ytKertomus: "Kertomus",
  kennelpiiri: "Piiri",
  kennelpiirinro: "10",
  sklKoeId: 12345,
  dogCount: 1,
  entries: [],
};

const event2 = {
  ...event1,
  trialEventId: "event-2",
  eventDate: "2026-04-15",
  eventPlace: "Espoo",
  eventName: "Talvikoe",
  jarjestaja: "Uusi seura",
  ylituomari: "New Judge",
  ylituomariNumero: "456",
  ytKertomus: "Uusi kertomus",
  kennelpiiri: "Uusi piiri",
  kennelpiirinro: "11",
  sklKoeId: 67890,
};

describe("AdminTrialEventEditDialog", () => {
  it("renders fields with selected event values", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventEditDialog, {
        open: true,
        selectedEvent: event1,
        isPending: false,
        errorText: null,
        onClose: vi.fn(),
        onSave: vi.fn(async () => true),
      }),
    );

    expect(html).toContain("admin.trials.manage.eventModal.title");
    expect(html).toContain('value="2026-04-14"');
    expect(html).toContain('value="Helsinki"');
    expect(html).toContain('value="Kerho"');
    expect(html).toContain('value="Judge"');
    expect(html).toContain('value="12345"');
  });

  it("renders the updated selected event values", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventEditDialog, {
        open: true,
        selectedEvent: event2,
        isPending: false,
        errorText: null,
        onClose: vi.fn(),
        onSave: vi.fn(async () => true),
      }),
    );

    expect(html).toContain('value="2026-04-15"');
    expect(html).toContain('value="Espoo"');
    expect(html).toContain('value="Uusi seura"');
    expect(html).toContain('value="New Judge"');
    expect(html).toContain('value="67890"');
  });

  it("rejects malformed sklKoeId values and accepts valid ones", () => {
    expect(toTrialEventDraft(event1)).toEqual({
      eventDate: "2026-04-14",
      eventPlace: "Helsinki",
      jarjestaja: "Kerho",
      ylituomari: "Judge",
      ylituomariNumero: "123",
      ytKertomus: "Kertomus",
      kennelpiiri: "Piiri",
      kennelpiirinro: "10",
      sklKoeId: "12345",
    });
    expect(parseSklKoeIdDraft("")).toBeNull();
    expect(parseSklKoeIdDraft("12abc")).toBeNull();
    expect(parseSklKoeIdDraft("1.9")).toBeNull();
    expect(parseSklKoeIdDraft("12345")).toBe(12345);
  });
});
