import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Beagle v2" })).toBeVisible();
  await expect(page.getByText("API import endpoint is active")).toBeVisible();
});
