export function createHudHeader({ sessionStore, themeStore, uiStore, router }) {
  const header = document.createElement("header");
  header.className = "hud-header";

  function render() {
    const session = sessionStore.getState();
    const theme = themeStore.getState();
    header.innerHTML = `
      <div class="mono">
        <strong>OVERWATCH SYSTEMS</strong>
        <div class="muted">Forensic Command Surface</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn" data-action="palette">Cmd+K</button>
        <button class="btn" data-action="theme">Theme: ${theme.mode}</button>
        <span class="muted mono">${session.user?.email || "anonymous"}</span>
        ${
          session.user
            ? '<button class="btn" data-action="logout">Logout</button>'
            : '<a class="btn" data-link href="/login">Login</a>'
        }
      </div>
    `;
  }

  header.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "theme") themeStore.toggleTheme();
    if (action === "palette") uiStore.openPalette();
    if (action === "logout") {
      await sessionStore.logout();
      router.navigate("/login");
    }
  });

  sessionStore.subscribe(render);
  themeStore.subscribe(render);
  render();
  return header;
}
