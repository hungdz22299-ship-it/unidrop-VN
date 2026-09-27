const PREFIX = 'unidrop_';

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export function isStorageAvailable(): boolean {
  try {
    const key = `${PREFIX}health`;
    localStorage.setItem(key, 'ok');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getStorageStatus(): 'available' | 'unavailable' {
  return isStorageAvailable() ? 'available' : 'unavailable';
}
