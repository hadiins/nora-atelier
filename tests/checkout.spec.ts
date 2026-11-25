import { test, expect } from "@playwright/test";

test("storefront loads and opens checkout flow", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.getByText("آتلیه نورا")).toBeVisible();
  await page.getByRole("button", { name: "افزودن" }).first().click();
  await page.getByRole("button", { name: /سبد خرید/ }).click();
  await expect(page.getByText("سبد خرید")).toBeVisible();
});
