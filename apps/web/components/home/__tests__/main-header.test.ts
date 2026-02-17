import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MainHeader } from "../main-header";

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) =>
    React.createElement("img", props),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "home.hero.logoAlt": "Logo alt",
        "home.hero.title": "Home title",
        "home.hero.description": "Home description",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("MainHeader", () => {
  it("renders translated hero title and description", () => {
    const html = renderToStaticMarkup(React.createElement(MainHeader));

    expect(html).toContain("Home title");
    expect(html).toContain("Home description");
    expect(html).toContain('alt="Logo alt"');
  });
});
