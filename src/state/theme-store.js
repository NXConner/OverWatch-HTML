const STORAGE_KEY = "ow.theme";

const THEMES = {
  dark: "dark",
  light: "light",
};

export function createThemeStore() {
  let state = { mode: localStorage.getItem(STORAGE_KEY) || THEMES.dark };
  const subscribers = new Set();

  function apply() {
    document.documentElement.setAttribute("data-theme", state.mode);
  }

  function notify() {
    apply();
    for (const cb of subscribers) cb(state);
  }

  function setTheme(mode) {
    if (!THEMES[mode]) return;
    state = { ...state, mode };
    localStorage.setItem(STORAGE_KEY, mode);
    notify();
  }

  function toggleTheme() {
    setTheme(state.mode === THEMES.dark ? THEMES.light : THEMES.dark);
  }

  function subscribe(cb) {
    subscribers.add(cb);
    cb(state);
    return () => subscribers.delete(cb);
  }

  apply();

  return {
    getState: () => state,
    subscribe,
    setTheme,
    toggleTheme,
  };
}
