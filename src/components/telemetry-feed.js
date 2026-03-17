export function createTelemetryFeed(api) {
  const root = document.createElement("section");
  root.className = "panel";

  let timer = null;

  async function refresh() {
    try {
      const stats = await api.get("/stats");
      const events = stats?.recentEvents || [];
      root.innerHTML = `
        <div class="kpi">
          <strong class="mono">Live Telemetry</strong>
          <span class="muted mono">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="telemetry-feed">
          ${
            events.length
              ? events
                  .slice(0, 12)
                  .map(
                    (evt) => `
              <article class="list-item">
                <div class="mono">${evt.eventType || "event"}</div>
                <div class="muted">${evt.source || "unknown source"}</div>
              </article>
            `
                  )
                  .join("")
              : '<div class="muted">No telemetry events available.</div>'
          }
        </div>
      `;
    } catch (error) {
      root.innerHTML = `<div class="muted">Telemetry unavailable: ${error.message}</div>`;
    }
  }

  function start() {
    refresh();
    timer = window.setInterval(refresh, 20000);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
  }

  return { element: root, start, stop };
}
