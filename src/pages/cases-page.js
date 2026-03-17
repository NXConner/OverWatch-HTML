import { createPage, addErrorBox } from "./page-utils.js";

export async function createCasesPage({ api }) {
  const root = createPage("Cases");
  const panel = document.createElement("article");
  panel.className = "panel";
  panel.innerHTML = `
    <h3 class="mono">Create Case</h3>
    <form id="case-form" class="grid-2">
      <label class="field">Title<input name="title" required /></label>
      <label class="field">Priority
        <select name="priority">
          <option value="low">low</option>
          <option value="medium" selected>medium</option>
          <option value="high">high</option>
        </select>
      </label>
      <label class="field" style="grid-column:1/-1;">Description<textarea name="description"></textarea></label>
      <button class="btn btn-primary" style="width:max-content;">Create</button>
      <span id="case-status" class="muted"></span>
    </form>
  `;
  root.appendChild(panel);

  const list = document.createElement("article");
  list.className = "panel";
  root.appendChild(list);

  async function loadCases() {
    const data = await api.get("/cases?limit=50");
    list.innerHTML = `
      <h3 class="mono">Case Inventory</h3>
      <ul class="list">
        ${(data.items || [])
          .map(
            (item) =>
              `<li class="list-item"><a data-link href="/cases/${item.id}">${item.caseNumber} - ${item.title}</a></li>`
          )
          .join("")}
      </ul>
    `;
  }

  try {
    await loadCases();
  } catch (error) {
    addErrorBox(root, error.message);
  }

  const form = panel.querySelector("#case-form");
  const status = panel.querySelector("#case-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    status.textContent = "Creating...";
    try {
      await api.post("/cases", body);
      status.textContent = "Case created.";
      form.reset();
      await loadCases();
    } catch (error) {
      status.textContent = error.message;
    }
  });

  return root;
}
