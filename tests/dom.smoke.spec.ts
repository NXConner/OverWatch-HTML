import { expect, test } from "@playwright/test";

test("renders a basic app shell in DOM", async ({ page }) => {
  await page.setContent(`
    <main>
      <h1 id="title">OverWatch Systems</h1>
      <p id="status">ready</p>
    </main>
  `);

  await expect(page.locator("#title")).toHaveText("OverWatch Systems");
  await expect(page.locator("#status")).toHaveText("ready");
});
