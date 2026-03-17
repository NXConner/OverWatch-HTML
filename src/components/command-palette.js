const COMMANDS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Cases", path: "/cases" },
  { label: "Upload", path: "/upload" },
  { label: "Analysis", path: "/analysis" },
  { label: "Events", path: "/events" },
  { label: "Timeline", path: "/events/timeline" },
  { label: "Intelligence", path: "/intelligence" },
  { label: "Map", path: "/map" },
  { label: "Subjects", path: "/subjects" },
  { label: "Audit", path: "/audit" },
  { label: "Settings", path: "/settings" },
  { label: "Contact", path: "/contact" },
];

export function createCommandPalette({ uiStore, router }) {
  const overlay = document.createElement("div");
  overlay.className = "palette-overlay";
  overlay.style.display = "none";

  function render() {
    const state = uiStore.getState();
    overlay.style.display = state.paletteOpen ? "grid" : "none";
    overlay.innerHTML = `
      <section class="palette-card">
        <div class="field">
          <label class="muted mono">Command</label>
          <input id="cmd-input" placeholder="Type route or name" />
        </div>
        <ul class="list" id="cmd-list" style="margin-top:10px;">
          ${COMMANDS.map(
            (cmd) =>
              `<li><button class="btn" style="width:100%;text-align:left;" data-cmd="${cmd.path}">${cmd.label} <span class="muted">${cmd.path}</span></button></li>`
          ).join("")}
        </ul>
      </section>
    `;
    if (!state.paletteOpen) return;
    const input = overlay.querySelector("#cmd-input");
    const list = overlay.querySelector("#cmd-list");
    input?.focus();
    input?.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      list.innerHTML = COMMANDS.filter(
        (cmd) => cmd.label.toLowerCase().includes(q) || cmd.path.includes(q)
      )
        .map(
          (cmd) =>
            `<li><button class="btn" style="width:100%;text-align:left;" data-cmd="${cmd.path}">${cmd.label} <span class="muted">${cmd.path}</span></button></li>`
        )
        .join("");
    });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) uiStore.closePalette();
    const path = event.target.closest("[data-cmd]")?.dataset.cmd;
    if (!path) return;
    uiStore.closePalette();
    router.navigate(path);
  });

  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      uiStore.togglePalette();
    }
    if (event.key === "Escape") uiStore.closePalette();
  });

  uiStore.subscribe(render);
  render();
  return overlay;
}
