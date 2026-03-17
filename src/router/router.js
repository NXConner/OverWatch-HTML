function trimSlash(path) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

function parsePattern(pattern) {
  const tokens = trimSlash(pattern).split("/").filter(Boolean);
  return tokens.map((token) => {
    if (token.startsWith(":")) {
      return { dynamic: true, key: token.slice(1) };
    }
    return { dynamic: false, value: token };
  });
}

export function createRouter({ routes, onRoute }) {
  const table = routes.map((route) => ({
    ...route,
    tokens: parsePattern(route.path),
  }));

  function resolve(pathname) {
    const clean = trimSlash(pathname);
    const parts = clean.split("/").filter(Boolean);
    for (const route of table) {
      if (route.tokens.length !== parts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < route.tokens.length; i += 1) {
        const token = route.tokens[i];
        const part = parts[i];
        if (!token.dynamic && token.value !== part) {
          ok = false;
          break;
        }
        if (token.dynamic) {
          params[token.key] = decodeURIComponent(part);
        }
      }
      if (ok) return { route, params };
    }
    return null;
  }

  function navigate(path, { replace = false } = {}) {
    const next = trimSlash(path || "/");
    if (replace) {
      window.history.replaceState({}, "", next);
    } else {
      window.history.pushState({}, "", next);
    }
    run();
  }

  function run() {
    const match = resolve(window.location.pathname);
    onRoute(match);
  }

  function start() {
    window.addEventListener("popstate", run);
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[data-link]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http")) return;
      event.preventDefault();
      navigate(href);
    });
    run();
  }

  return { start, navigate };
}
