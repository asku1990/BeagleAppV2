import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ListingSectionShell } from "../listing-section-shell";

const ListingSectionShellUnderTest = ListingSectionShell as React.ComponentType<
  Omit<React.ComponentProps<typeof ListingSectionShell>, "children">
>;

const { cardMock } = vi.hoisted(() => ({
  cardMock: vi.fn(
    ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => React.createElement("div", props as Record<string, string>, children),
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: cardMock,
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  CardHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  CardTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

describe("ListingSectionShell", () => {
  it("suppresses hydration warnings on the wrapper card", () => {
    renderToStaticMarkup(
      React.createElement(
        ListingSectionShellUnderTest,
        { title: "Event search" },
        React.createElement("div", null, "Content"),
      ),
    );

    expect(cardMock.mock.calls[0]?.[0]).toMatchObject({
      suppressHydrationWarning: true,
    });
  });
});
