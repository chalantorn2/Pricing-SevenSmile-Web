// Recently-opened items for the home screen. Purely local: it records what this
// browser opened so returning users get a one-click shortcut back, with no server
// storage. Detail pages call pushRecentItem() once their record has loaded.

const KEY = "recent_items";
const MAX_ITEMS = 8;

export function getRecentItems() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * item: { type: "tour" | "hotel" | "restaurant" | "supplier",
 *         id: number|string (tour/supplier id or hotel/restaurant slug),
 *         name: string, meta: string }
 */
export function pushRecentItem(item) {
  if (!item?.type || !item?.name || item.id === undefined || item.id === null) {
    return;
  }
  const rest = getRecentItems().filter(
    (it) => !(it.type === item.type && it.id === item.id)
  );
  const entry = { ...item, at: Date.now() };
  localStorage.setItem(KEY, JSON.stringify([entry, ...rest].slice(0, MAX_ITEMS)));
}
