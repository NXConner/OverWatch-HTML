export function createPage(title) {
  const root = document.createElement("section");
  root.className = "page-wrap";
  root.innerHTML = `<h2 class="mono">${title}</h2>`;
  return root;
}

export function addErrorBox(root, message) {
  const box = document.createElement("article");
  box.className = "panel";
  box.innerHTML = `<p class="muted">Error: ${message}</p>`;
  root.appendChild(box);
}

export function addJsonPanel(root, title, data) {
  const panel = document.createElement("article");
  panel.className = "panel";
  panel.innerHTML = `
    <h3 class="mono">${title}</h3>
    <pre class="mono" style="white-space:pre-wrap;max-height:420px;overflow:auto;">${escapeHtml(
      JSON.stringify(data, null, 2)
    )}</pre>
  `;
  root.appendChild(panel);
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
