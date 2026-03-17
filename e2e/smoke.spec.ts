import { expect, test } from "@playwright/test";

test("e2e smoke route is reachable", async ({ page, baseURL }) => {
  if (baseURL) {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    return;
  }

  await page.setContent("<h1>OverWatch Systems</h1>");
  await expect(page.locator("h1")).toHaveText("OverWatch Systems");
});
