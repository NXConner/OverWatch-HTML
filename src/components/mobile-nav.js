const MOBILE_ITEMS = [
  { path: "/dashboard", label: "Home" },
  { path: "/cases", label: "Cases" },
  { path: "/events", label: "Events" },
  { path: "/analysis", label: "Analysis" },
  { path: "/settings", label: "Settings" },
];

export function createMobileNav() {
  const nav = document.createElement("nav");
  nav.className = "mobile-nav";

  function render(pathname) {
    nav.innerHTML = MOBILE_ITEMS.map((item) => {
      const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
      return `<a data-link href="${item.path}" class="nav-link ${active ? "active" : ""}">${item.label}</a>`;
    }).join("");
  }

  return { element: nav, render };
}
