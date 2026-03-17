import { createPage, addErrorBox } from "./page-utils.js";

export async function createIntelligencePage({ api }) {
  const root = createPage("Intelligence");
  const panel = document.createElement("article");
  panel.className = "panel";
  panel.innerHTML = `
    <h3 class="mono">LLM Intelligence</h3>
    <form id="intel-form" class="grid-2">
      <label class="field">Case<select name="caseId"></select></label>
      <label class="field">Type
        <select name="analysisType">
          <option value="general">general</option>
          <option value="behavioral">behavioral</option>
          <option value="temporal">temporal</option>
        </select>
      </label>
      <label class="field" style="grid-column:1/-1;">Context<textarea name="contextInjection"></textarea></label>
      <button class="btn btn-primary" style="width:max-content;">Run Intelligence</button>
    </form>
    <pre id="intel-output" class="mono" style="white-space:pre-wrap;max-height:380px;overflow:auto;"></pre>
  `;
  root.appendChild(panel);

  try {
    const data = await api.get("/cases?limit=100");
    panel.querySelector("select[name='caseId']").innerHTML = (data.items || [])
      .map((item) => `<option value="${item.id}">${item.caseNumber} - ${item.title}</option>`)
      .join("");
  } catch (error) {
    addErrorBox(root, error.message);
  }

  panel.querySelector("#intel-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const output = panel.querySelector("#intel-output");
    output.textContent = "Running intelligence...";
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/intelligence", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const fail = await response.text();
        throw new Error(fail || "Intelligence request failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      output.textContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output.textContent += decoder.decode(value, { stream: true });
      }
    } catch (error) {
      output.textContent = error.message;
    }
  });

  return root;
}
