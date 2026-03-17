import { createPage, addErrorBox, addJsonPanel } from "./page-utils.js";

export async function createAnalysisPage({ api }) {
  const root = createPage("Analysis");
  const formPanel = document.createElement("article");
  formPanel.className = "panel";
  formPanel.innerHTML = `
    <h3 class="mono">Case Analysis</h3>
    <form id="analysis-form" class="grid-2">
      <label class="field">Case<select name="caseId" required></select></label>
      <button class="btn btn-primary" style="width:max-content;">Run</button>
    </form>
  `;
  root.appendChild(formPanel);

  const output = document.createElement("section");
  root.appendChild(output);

  try {
    const cases = await api.get("/cases?limit=100");
    formPanel.querySelector("select").innerHTML = (cases.items || [])
      .map((item) => `<option value="${item.id}">${item.caseNumber} - ${item.title}</option>`)
      .join("");
  } catch (error) {
    addErrorBox(root, error.message);
  }

  formPanel.querySelector("#analysis-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    output.innerHTML = "";
    const caseId = new FormData(event.currentTarget).get("caseId");
    try {
      const data = await api.get(`/analysis?caseId=${encodeURIComponent(caseId)}`);
      addJsonPanel(output, "Analysis Output", data);
    } catch (error) {
      addErrorBox(output, error.message);
    }
  });

  return root;
}
