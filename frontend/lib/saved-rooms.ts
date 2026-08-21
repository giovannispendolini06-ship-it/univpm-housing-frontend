/**
 * Client-side saved rooms (localStorage).
 * No DB migration required — syncs per browser until server saves land.
 */

const STORAGE_KEY = "coabito_saved_room_ids";

export function readSavedRoomIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function writeSavedRoomIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 50)));
  window.dispatchEvent(new CustomEvent("coabito:saved-rooms"));
}

export function isRoomSaved(roomId: string): boolean {
  return readSavedRoomIds().includes(roomId);
}

/** Returns true if now saved, false if removed. */
export function toggleSavedRoom(roomId: string): boolean {
  const ids = readSavedRoomIds();
  const idx = ids.indexOf(roomId);
  if (idx >= 0) {
    ids.splice(idx, 1);
    writeSavedRoomIds(ids);
    return false;
  }
  ids.unshift(roomId);
  writeSavedRoomIds(ids);
  return true;
}
