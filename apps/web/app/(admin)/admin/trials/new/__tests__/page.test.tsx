import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AdminTrialEventCreatePage from "../page";

const { clientPropsRef, toBusinessDateInputValueMock } = vi.hoisted(() => ({
  clientPropsRef: { current: null as { initialEventDate: string } | null },
  toBusinessDateInputValueMock: vi.fn(() => "2026-07-21"),
}));

vi.mock("@/components/admin/trials", () => ({
  AdminTrialEventCreatePageClient: (props: { initialEventDate: string }) => {
    clientPropsRef.current = props;
    return React.createElement("div", null, "create-trial-event");
  },
}));

vi.mock("@/lib/admin/core/date", () => ({
  toBusinessDateInputValue: toBusinessDateInputValueMock,
}));

describe("AdminTrialEventCreatePage", () => {
  it("renders the event creation client", () => {
    expect(renderToStaticMarkup(<AdminTrialEventCreatePage />)).toContain(
      "create-trial-event",
    );
    expect(toBusinessDateInputValueMock).toHaveBeenCalledWith(expect.any(Date));
    expect(clientPropsRef.current).toEqual({
      initialEventDate: "2026-07-21",
    });
  });
});
