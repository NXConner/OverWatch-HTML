const SESSION_KEY = "ow.session";

export function createSessionStore(api) {
  let state = {
    status: "idle",
    user: null,
    error: null,
  };
  const subscribers = new Set();

  function notify() {
    for (const cb of subscribers) cb(state);
  }

  function setState(next) {
    state = { ...state, ...next };
    notify();
  }

  function saveSession(user) {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async function bootstrap() {
    setState({ status: "loading", error: null });
    try {
      const session = await api.get("/auth/me");
      const user = session?.user || null;
      saveSession(user);
      setState({ status: "ready", user, error: null });
      return user;
    } catch {
      const cached = localStorage.getItem(SESSION_KEY);
      const user = cached ? JSON.parse(cached) : null;
      setState({ status: "ready", user, error: null });
      return user;
    }
  }

  async function login(email, password) {
    setState({ status: "loading", error: null });
    try {
      const payload = await api.post("/auth/login", { email, password });
      const user = payload?.user || null;
      saveSession(user);
      setState({ status: "ready", user, error: null });
      return user;
    } catch (error) {
      saveSession(null);
      setState({ status: "ready", user: null, error: error.message });
      throw error;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // Some backends only rely on cookie expiration.
    }
    saveSession(null);
    setState({ status: "ready", user: null, error: null });
  }

  function subscribe(cb) {
    subscribers.add(cb);
    cb(state);
    return () => subscribers.delete(cb);
  }

  return {
    getState: () => state,
    subscribe,
    bootstrap,
    login,
    logout,
  };
}
