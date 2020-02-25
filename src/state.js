const key = "gameState";
const initialState = {
  playerHealth: 3
};
let listeners = [];
let gamestate = load(key, initialState);

function listen(listener) {
  listeners = listeners.concat(listener);
}

function update(updater) {
  gamestate = updater(gamestate);
  listeners.forEach(listener => listener(gamestate));
  save(key, gamestate);
}

function get() {
  return gamestate;
}

function save(key, state) {
  localStorage.setItem(key, JSON.stringify(state));
}

function load(key, fallback) {
  const state = localStorage.getItem(key);
  if (state != null) {
    return JSON.parse(state);
  } else {
    return fallback;
  }
}

export default { listen, update, get };
