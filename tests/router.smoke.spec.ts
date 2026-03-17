import { expect, test } from "@playwright/test";

test("hash router updates route content", async ({ page }) => {
  await page.setContent(`
    <main>
      <nav>
        <a href="#/" id="home-link">Home</a>
        <a href="#/cases" id="cases-link">Cases</a>
      </nav>
      <section id="view"></section>
    </main>
    <script>
      const view = document.getElementById("view");
      function render() {
        const route = window.location.hash || "#/";
        if (route === "#/cases") {
          view.textContent = "Cases View";
          return;
        }
        view.textContent = "Home View";
      }
      window.addEventListener("hashchange", render);
      render();
    </script>
  `);

  await expect(page.locator("#view")).toHaveText("Home View");
  await page.locator("#cases-link").click();
  await expect(page.locator("#view")).toHaveText("Cases View");
});
