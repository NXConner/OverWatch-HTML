import { createPage, addErrorBox, addJsonPanel } from "./page-utils.js";

export async function createCaseDetailPage({ api, params }) {
  const root = createPage(`Case Detail: ${params.id}`);
  try {
    const detail = await api.get(`/cases/${params.id}`);
    const header = document.createElement("article");
    header.className = "panel";
    header.innerHTML = `
      <h3 class="mono">${detail.caseNumber} - ${detail.title}</h3>
      <p class="muted">${detail.description || "No description."}</p>
      <p class="muted">Subjects: ${detail._count?.subjects || 0} | Events: ${
      detail._count?.events || 0
    }</p>
    `;
    root.appendChild(header);
    addJsonPanel(root, "Recent Events", detail.events || []);
  } catch (error) {
    addErrorBox(root, error.message);
  }
  return root;
}
