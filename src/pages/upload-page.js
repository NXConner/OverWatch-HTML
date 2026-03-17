import { createPage, addErrorBox } from "./page-utils.js";

export async function createUploadPage({ api }) {
  const root = createPage("Upload");
  const panel = document.createElement("article");
  panel.className = "panel";
  panel.innerHTML = `
    <h3 class="mono">Upload Forensic Source</h3>
    <form id="upload-form" class="grid-2">
      <label class="field">Case
        <select name="caseId" required></select>
      </label>
      <label class="field">File
        <input type="file" name="file" required />
      </label>
      <button class="btn btn-primary" style="width:max-content;">Upload</button>
      <span id="upload-status" class="muted"></span>
    </form>
  `;
  root.appendChild(panel);

  try {
    const cases = await api.get("/cases?limit=100");
    const select = panel.querySelector('select[name="caseId"]');
    select.innerHTML = (cases.items || [])
      .map((item) => `<option value="${item.id}">${item.caseNumber} - ${item.title}</option>`)
      .join("");
  } catch (error) {
    addErrorBox(root, error.message);
  }

  panel.querySelector("#upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = panel.querySelector("#upload-status");
    const form = event.currentTarget;
    const data = new FormData(form);
    const caseId = data.get("caseId");
    const file = data.get("file");
    if (!file || !caseId) return;
    status.textContent = "Preparing upload...";
    try {
      const presigned = await api.post("/upload/presigned", {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });
      await fetch(presigned.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      await api.post("/upload/complete", {
        key: presigned.key,
        caseId,
        fileName: file.name,
      });
      status.textContent = "Upload complete.";
    } catch (error) {
      status.textContent = error.message;
    }
  });

  return root;
}
