import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialEventEditDialog } from "../admin-trial-event-edit-dialog";

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

describe("AdminTrialEventEditDialog", () => {
  it("renders fields with selected event values", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventEditDialog, {
        open: true,
        selectedEvent: {
          trialEventId: "event-1",
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
        },
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
});
