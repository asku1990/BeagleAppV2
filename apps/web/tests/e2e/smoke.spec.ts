import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Beagle v2" })).toBeVisible();
  await expect(
    page.getByText("Import feature is not implemented yet."),
  ).toBeVisible();
});
