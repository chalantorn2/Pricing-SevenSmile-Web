// Last successful payload per list screen, held in memory for the life of the tab.
//
// Every list screen refetches its whole table on mount, so switching menus used to
// throw the rendered list away and blank to a skeleton until the network answered —
// on a slow machine that reads as the app hanging on the page you just left. Seeding
// the screen from here lets it repaint the rows it had a moment ago in the first
// frame; the fetch still runs and still overwrites both the state and this entry, so
// what is cached is only ever a frame ahead of the network, never a stand-in for it.
//
// Keys carry whatever narrows the request (province, supplier type), so two screens
// showing different slices never read each other's rows.
const cache = new Map();

export function readCache(key) {
  return cache.get(key);
}

export function writeCache(key, value) {
  cache.set(key, value);
  return value;
}

export function hasCache(key) {
  return cache.has(key);
}
