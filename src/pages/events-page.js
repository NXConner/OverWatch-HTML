import { createPage, addErrorBox } from "./page-utils.js";

export async function createEventsPage({ api }) {
  const root = createPage("Events");
  try {
    const events = await api.get("/events");
    const panel = document.createElement("article");
    panel.className = "panel";
    panel.innerHTML = `
      <h3 class="mono">Recent Events</h3>
      <ul class="list">
        ${(events || [])
          .slice(0, 120)
          .map(
            (evt) =>
              `<li class="list-item"><strong>${evt.eventType}</strong> <span class="muted">${evt.severity}</span><div class="muted">${evt.source || ""}</div></li>`
          )
          .join("")}
      </ul>
    `;
    root.appendChild(panel);
  } catch (error) {
    addErrorBox(root, error.message);
  }
  return root;
}
