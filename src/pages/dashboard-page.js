import { createPage, addErrorBox } from "./page-utils.js";

export async function createDashboardPage({ api }) {
  const root = createPage("Dashboard");
  try {
    const stats = await api.get("/stats");
    const cards = document.createElement("section");
    cards.className = "grid-3";
    cards.innerHTML = `
      <article class="panel kpi"><span class="mono">Cases</span><strong>${stats.cases || 0}</strong></article>
      <article class="panel kpi"><span class="mono">Subjects</span><strong>${stats.subjects || 0}</strong></article>
      <article class="panel kpi"><span class="mono">Events</span><strong>${stats.events || 0}</strong></article>
    `;
    root.appendChild(cards);

    const recent = document.createElement("article");
    recent.className = "panel";
    recent.innerHTML = `
      <h3 class="mono">Recent Cases</h3>
      <ul class="list">
        ${(stats.recentCases || [])
          .map(
            (item) =>
              `<li class="list-item"><a data-link href="/cases/${item.id}">${item.caseNumber} - ${item.title}</a></li>`
          )
          .join("")}
      </ul>
    `;
    root.appendChild(recent);
  } catch (error) {
    addErrorBox(root, error.message);
  }
  return root;
}
