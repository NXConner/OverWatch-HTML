const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/cases", label: "Cases" },
  { path: "/upload", label: "Upload" },
  { path: "/analysis", label: "Analysis" },
  { path: "/events", label: "Events" },
  { path: "/events/timeline", label: "Timeline" },
  { path: "/intelligence", label: "Intelligence" },
  { path: "/map", label: "Map" },
  { path: "/subjects", label: "Subjects" },
  { path: "/audit", label: "Audit" },
  { path: "/settings", label: "Settings" },
  { path: "/contact", label: "Contact" },
];

export function createHudSidebar() {
  const aside = document.createElement("aside");
  aside.className = "sidebar";

  function render(pathname) {
    aside.innerHTML = `
      <div class="mono muted" style="margin-bottom:10px;">// NAVIGATION</div>
      <nav>
        ${NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return `<a data-link href="${item.path}" class="nav-link ${isActive ? "active" : ""}">${item.label}</a>`;
        }).join("")}
      </nav>
    `;
  }

  return { element: aside, render };
}
