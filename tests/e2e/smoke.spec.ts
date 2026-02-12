import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Suomen Beaglejärjestö" }),
  ).toBeVisible();
  await expect(page.getByTestId("sidebar-title")).toBeVisible();
});
