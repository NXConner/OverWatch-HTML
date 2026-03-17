import { createPage, addErrorBox, addJsonPanel } from "./page-utils.js";

export async function createEventsTimelinePage({ api }) {
  const root = createPage("Events Timeline");
  const controls = document.createElement("article");
  controls.className = "panel";
  controls.innerHTML = `
    <h3 class="mono">Timeline Query</h3>
    <form id="timeline-form" class="grid-2">
      <label class="field">Case<select name="caseId"></select></label>
      <button class="btn btn-primary" style="width:max-content;">Load Timeline</button>
    </form>
  `;
  root.appendChild(controls);
  const output = document.createElement("section");
  root.appendChild(output);

  try {
    const data = await api.get("/cases?limit=100");
    controls.querySelector("select").innerHTML = (data.items || [])
      .map((item) => `<option value="${item.id}">${item.caseNumber} - ${item.title}</option>`)
      .join("");
  } catch (error) {
    addErrorBox(root, error.message);
  }

  controls.querySelector("#timeline-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const caseId = new FormData(event.currentTarget).get("caseId");
    output.innerHTML = "";
    try {
      const timeline = await api.get(`/events/timeline?caseId=${encodeURIComponent(caseId)}`);
      addJsonPanel(output, "Timeline", timeline);
    } catch (error) {
      addErrorBox(output, error.message);
    }
  });

  return root;
}
