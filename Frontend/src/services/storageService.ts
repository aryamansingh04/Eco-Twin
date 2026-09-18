// Thin localStorage wrapper standing in for a future Django-backed
// persistence layer. Every read/write goes through here so swapping the
// implementation later (fetch() against /api/...) touches one file.
const NAMESPACE = 'ecotwin'

function key(k: string) {
  return `${NAMESPACE}:${k}`
}

export function loadJSON<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(k))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(k: string, value: T): void {
  try {
    localStorage.setItem(key(k), JSON.stringify(value))
  } catch {
    // localStorage can throw in private-browsing / quota-exceeded cases;
    // failing silently is acceptable for a prototype persistence layer.
  }
}

export function clearAll(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`${NAMESPACE}:`))
    .forEach((k) => localStorage.removeItem(k))
}
