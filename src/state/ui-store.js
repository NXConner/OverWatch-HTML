export function createUiStore() {
  let state = {
    paletteOpen: false,
  };
  const subscribers = new Set();

  function notify() {
    for (const cb of subscribers) cb(state);
  }

  function setState(next) {
    state = { ...state, ...next };
    notify();
  }

  function subscribe(cb) {
    subscribers.add(cb);
    cb(state);
    return () => subscribers.delete(cb);
  }

  return {
    getState: () => state,
    subscribe,
    openPalette: () => setState({ paletteOpen: true }),
    closePalette: () => setState({ paletteOpen: false }),
    togglePalette: () => setState({ paletteOpen: !state.paletteOpen }),
  };
}
