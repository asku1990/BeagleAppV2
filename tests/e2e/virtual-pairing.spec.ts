import { expect, test } from "@playwright/test";

test("public virtual pairing page loads", async ({ page }) => {
  await page.goto("/beagle/virtual-pairing");

  await expect(
    page.getByRole("heading", { name: "Virtuaaliparitus" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Hae" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Laske" })).toBeVisible();
});
